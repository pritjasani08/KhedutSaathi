const express = require('express');
const profileRoutes = require('./routes/profileRoutes');

profileRoutes.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} /api/profile${r.route.path}`);
  }
});
