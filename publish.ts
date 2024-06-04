import manifest from './dist/manifest.json' assert { type: 'json' }
import readline from 'readline'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

const EXT_URL = 'https://hub.creatorsinc.com/cinc-ext.crx'
const EXT_ID = 'ckdebeemfomlijnfnhgegcifpgckkkff'
const EXT_VERSION = manifest.version

// Run npm build
execSync('npm run build', { stdio: 'inherit' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log(`Publishing extension with ID ${EXT_ID} and version ${EXT_VERSION}`)
rl.question('Are you sure? (Y/n)', answer => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Aborted')
    process.exit()
  }
  rl.close()
})

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">
  <app appid="${EXT_ID}">
    <updatecheck codebase="${EXT_URL}" version="${EXT_VERSION}"/>
  </app>
</gupdate>
`

// Write the XML to a file at ../backend/public/cinc-ext.xml
const publicPath = path.resolve('../backend/public')
fs.writeFileSync(path.resolve(publicPath, 'cinc-ext.xml'), xml)

// Execute Chrome binary to build the .crx file
const chromePath = '/Applications/GoogleChrome.app/Contents/MacOS/GoogleChrome'
const distPath = path.resolve('./dist')
const keyPath = path.resolve('./key.pem')
if (!fs.existsSync(distPath)) {
  console.error(`${distPath} not found. Run \`npm build\` first`)
  process.exit(1)
}
if (!fs.existsSync(keyPath)) {
  console.error(
    `${keyPath} not found. You must have the private key used to build the previous version.`,
  )
  process.exit(1)
}

const args = ['--pack-extension=' + distPath, '--pack-extension-key=' + keyPath]
execSync(chromePath + ' ' + args.join(' '), { stdio: 'inherit' })

// Place the .crx file in the backend/public folder
fs.renameSync(
  path.resolve('./dist.crx'),
  path.resolve(publicPath, 'cinc-ext.crx'),
)

console.log('Extension built. Deploy the backend to publish to users.')
