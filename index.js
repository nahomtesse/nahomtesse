const express = require('express');
const fetch = require('node-fetch'); 
const { createCanvas, loadImage } = require('canvas');

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const GITHUB_USERNAME = 'nahomtesse'; 

async function getRepoStats() {
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  const repos = await response.json();

  let totalStars = 0;
  let totalForks = 0;
  repos.forEach(repo => {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
  });

  return { totalStars, totalForks, repoCount: repos.length };
}

app.get('/api/stats-image', async (req, res) => {
  try {
    const stats = await getRepoStats();

    const width = 600;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2e3440'; 
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.font = 'bold 24px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`GitHub Stats for ${GITHUB_USERNAME}`, 20, 40);

    ctx.font = '16px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    ctx.fillStyle = '#b8c7d4'; 

    const padding = 20;
    const iconSize = 16;

    ctx.fillText(`Repos: ${stats.repoCount}`, padding, 80);
    ctx.fillText(`★ ${stats.totalStars}`, padding, 110);
    ctx.fillText(`Forks: ${stats.totalForks}`, padding, 140);

    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
