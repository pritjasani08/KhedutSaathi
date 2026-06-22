const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GROQ_API_KEY is missing from backend .env' });
    }

    const groq = new Groq({ apiKey });

    // The audio file is temporarily saved by multer
    const filePath = req.file.path;
    
    // We can explicitly add the original extension if Groq is strict about extensions.
    // However, groq.audio.transcriptions accepts a ReadStream and might not strictly need the extension.
    // Just in case, let's rename it temporarily to have a .webm or .m4a extension.
    const ext = req.file.originalname ? path.extname(req.file.originalname) : '.webm';
    const filePathWithExt = filePath + ext;
    fs.renameSync(filePath, filePathWithExt);

    // Use Groq Whisper model
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePathWithExt),
      model: "whisper-large-v3",
      response_format: "json",
      temperature: 0.0
    });

    // Clean up the temporary file
    try { fs.unlinkSync(filePathWithExt); } catch (e) {}

    res.status(200).json({
      text: transcription.text
    });
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Attempt to clean up temp files if error occurs
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      try { fs.unlinkSync(req.file.path + (path.extname(req.file.originalname) || '.webm')); } catch (e) {}
    }

    res.status(500).json({ message: error.message || 'Failed to transcribe audio' });
  }
};

module.exports = {
  transcribeAudio
};
