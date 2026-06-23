const bcrypt = require('bcrypt');
const supabase = require('../config/supabaseClient');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// In-memory store for OTPs (For production, use Redis or Database)
// Structure: { 'email@example.com': { otp: '123456', userData: {...}, expiresAt: 1234567890 } }
const otpStore = new Map();

const sendOTP = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password, userType } = req.body;

    // 1. Basic validation
    if (!firstName || !lastName || !mobile || !email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Check if user already exists in Supabase
    const { data: existingUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, mobile')
      .or(`email.eq.${email},mobile.eq.${mobile}`)
      .single();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email is already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(409).json({ message: 'Mobile number is already registered' });
      }
    }

    // Ignore Supabase "No rows found" error (which means we are good to go)
    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Supabase Error checking existing user:', dbError);
      return res.status(500).json({ message: 'Database error while checking user' });
    }

    // 3. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Generate OTP and Expiry (10 minutes)
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // 5. Store in memory
    otpStore.set(email, {
      otp,
      userData: {
        first_name: firstName,
        last_name: lastName,
        mobile,
        email,
        password_hash: passwordHash,
        user_type: userType
      },
      expiresAt
    });

    // 6. Send Email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ message: 'Failed to process registration request' });
  }
};

const verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // 1. Check if we have an OTP session for this email
    const session = otpStore.get(email);
    if (!session) {
      return res.status(400).json({ message: 'OTP session expired or not found. Please register again.' });
    }

    // 2. Check expiration
    if (Date.now() > session.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // 3. Verify OTP
    if (session.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 4. OTP is correct! Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([session.userData])
      .select('id, first_name, last_name, email, user_type')
      .single();

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      return res.status(500).json({ message: 'Failed to create user in database' });
    }

    // 5. Success! Clear the OTP session
    otpStore.delete(email);

    // 6. Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, user_type: newUser.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Error in verifyOTPAndRegister:', error);
    res.status(500).json({ message: 'Failed to verify OTP and register user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Find user in Supabase by email or mobile
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},mobile.eq.${email}`)
      .single();

    if (dbError || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Login successful! Return user details (omit password_hash)
    const { password_hash, ...userWithoutPassword } = user;
    
    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Failed to process login request' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, firstName, lastName, mobile, userType } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to identify the user' });
    }

    // Update the user record in Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        mobile: mobile,
        user_type: userType
      })
      .eq('email', email)
      .select('id, first_name, last_name, email, mobile, user_type')
      .single();

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Failed to process update profile request' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { data: existingUser, error: dbError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (dbError || !existingUser) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      otp,
      type: 'reset',
      expiresAt
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Failed to process forgot password request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const session = otpStore.get(email);
    if (!session || session.type !== 'reset') {
      return res.status(400).json({ message: 'OTP session expired or not found. Please try again.' });
    }

    if (Date.now() > session.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (session.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      return res.status(500).json({ message: 'Failed to reset password in database' });
    }

    otpStore.delete(email);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

module.exports = {
  sendOTP,
  verifyOTPAndRegister,
  login,
  updateProfile,
  forgotPassword,
  resetPassword
};
