// Copyright (c) 2026 Iskra Software. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

// Restamps BRANDING and Android channel_constants.xml files from
// brand_config.js. Only touches the specific KEY=value / <string> entries
// it knows about — headers, comments and everything else in each file are
// left byte-for-byte untouched.
//
// Usage:
//   node generate_brand_files.js          # write changes
//   node generate_brand_files.js --check  # report what would change, exit 1 if so

'use strict'

const fs = require('fs')
const path = require('path')

const brand = require('./brand_config.js')

const srcDir = path.resolve(__dirname, '..', '..', '..')
const braveAppTheme = path.join(srcDir, 'brave', 'app', 'theme', 'brave')
const chromeAppTheme = path.join(srcDir, 'chrome', 'app', 'theme', 'brave')
const braveAndroidTheme = path.join(braveAppTheme, 'android')
const chromeChannelConstantsDest = path.join(
  srcDir,
  'chrome',
  'android',
  'java',
  'res_chromium_base',
  'values',
  'channel_constants.xml',
)

function patchKeyValueFile(filePath, values) {
  let content = fs.readFileSync(filePath, 'utf8')
  for (const [key, value] of Object.entries(values)) {
    const re = new RegExp(`^${key}=.*$`, 'm')
    if (!re.test(content)) {
      throw new Error(`Key ${key} not found in ${filePath}`)
    }
    content = content.replace(re, `${key}=${value}`)
  }
  return content
}

function patchChannelConstants(filePath, values) {
  let content = fs.readFileSync(filePath, 'utf8')
  for (const [name, value] of Object.entries(values)) {
    const re = new RegExp(
      `(<string name="${name}" translatable="false">)[^<]*(</string>)`,
    )
    if (!re.test(content)) {
      throw new Error(`String ${name} not found in ${filePath}`)
    }
    content = content.replace(re, `$1${value}$2`)
  }
  return content
}

function brandingValues(label, ext) {
  const productName = label ? `${brand.productName} ${label}` : brand.productName
  const bundleSuffix = ext ? `.${ext}` : ''
  return {
    COMPANY_FULLNAME: brand.companyFullname,
    COMPANY_SHORTNAME: brand.companyShortname,
    PRODUCT_FULLNAME: productName,
    PRODUCT_SHORTNAME: productName,
    PRODUCT_INSTALLER_FULLNAME: brand.installerFullname,
    PRODUCT_INSTALLER_SHORTNAME: brand.installerShortname,
    COPYRIGHT: `Copyright ${brand.copyrightYear} ${brand.copyrightHolder}. All rights reserved.`,
    MAC_BUNDLE_ID: `${brand.macBundleIdBase}${bundleSuffix}`,
    MAC_CREATOR_CODE: brand.macCreatorCode,
    MAC_TEAM_ID: brand.macTeamId,
  }
}

function channelConstantsValues(label) {
  const appName = label ? `${brand.productName} - ${label}` : brand.productName
  return {
    app_name: appName,
    bookmark_widget_title: `${brand.productName} bookmarks`,
    search_widget_title: `${brand.productName} search`,
    quick_action_search_widget_title: `${brand.productName} quick action search`,
  }
}

function collectUpdates() {
  const updates = new Map()

  for (const { ext, label } of brand.desktopChannels) {
    const filename = ext ? `BRANDING.${ext}` : 'BRANDING'
    const values = brandingValues(label, ext)
    const filePath = path.join(braveAppTheme, filename)
    updates.set(filePath, () => patchKeyValueFile(filePath, values))

    if (ext === brand.activeDesktopChannelExt) {
      const mirrorPath = path.join(chromeAppTheme, 'BRANDING')
      updates.set(mirrorPath, () => patchKeyValueFile(mirrorPath, values))
    }
  }

  for (const { relDir, label } of brand.androidChannels) {
    const values = channelConstantsValues(label)
    const filePath = path.join(braveAndroidTheme, relDir, 'channel_constants.xml')
    updates.set(filePath, () => patchChannelConstants(filePath, values))

    if (relDir === brand.activeAndroidChannelRelDir) {
      updates.set(chromeChannelConstantsDest, () =>
        patchChannelConstants(chromeChannelConstantsDest, values),
      )
    }
  }

  return updates
}

function main() {
  const checkOnly = process.argv.includes('--check')
  const updates = collectUpdates()
  let changed = false

  for (const [filePath, computeNewContent] of updates) {
    if (!fs.existsSync(filePath)) {
      console.warn(`skip (not found): ${filePath}`)
      continue
    }
    const existing = fs.readFileSync(filePath, 'utf8')
    const next = computeNewContent()
    if (existing === next) {
      continue
    }
    changed = true
    if (checkOnly) {
      console.log(`would update: ${filePath}`)
    } else {
      fs.writeFileSync(filePath, next, 'utf8')
      console.log(`updated: ${filePath}`)
    }
  }

  if (!changed) {
    console.log('Already up to date, nothing to do.')
  } else if (checkOnly) {
    process.exitCode = 1
  }
}

main()
