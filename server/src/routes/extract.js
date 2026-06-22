const router = require('express').Router()
const { spawn } = require('child_process')
const path = require('path')

const SCRIPT = path.join(__dirname, '../../pdf_to_markdown.py')

router.post(
  '/extract-pdf',
  require('express').raw({ type: 'application/octet-stream', limit: '20mb' }),
  (req, res) => {
    if (req.headers['x-extract-secret'] !== process.env.EXTRACT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const py = spawn('python3', [SCRIPT])
    const chunks = []

    py.stdout.on('data', chunk => chunks.push(chunk))
    py.stderr.on('data', err => console.warn('[markitdown] stderr:', err.toString()))
    py.on('close', code => {
      if (code !== 0) return res.status(500).json({ error: `markitdown exited with code ${code}` })
      res.type('text/plain').send(Buffer.concat(chunks).toString('utf8'))
    })
    py.on('error', err => res.status(500).json({ error: err.message }))

    py.stdin.write(req.body)
    py.stdin.end()
  }
)

module.exports = router
