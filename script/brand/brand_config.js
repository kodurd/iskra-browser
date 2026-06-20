// Copyright (c) 2026 Iskra Software. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

// Single source of truth for product branding. Edit the values below and
// run:
//   node brave/script/brand/generate_brand_files.js
// to restamp every BRANDING file and Android channel_constants.xml variant.
// Use --check to see what would change without writing anything.
//
// This does NOT touch Brave Shields naming or any brave.com backend URLs —
// those are intentionally out of scope for product renaming.

module.exports = {
  companyFullname: 'Iskra Software',
  companyShortname: 'Iskra',
  // Base/stable product name, with no channel suffix.
  productName: 'Iskra',
  installerFullname: 'Iskra Installer',
  installerShortname: 'Iskra Installer',
  copyrightYear: 2025,
  copyrightHolder: 'Iskra Authors',
  macBundleIdBase: 'com.iskra.Browser',
  macCreatorCode: 'Cr24',
  macTeamId: 'KL8N8XSYF4',

  // Desktop BRANDING.<ext> variants under brave/app/theme/brave/.
  // ext: null means the base "BRANDING" file (no channel suffix anywhere).
  // label: text appended to the product name and used (lowercased) as the
  // MAC_BUNDLE_ID suffix.
  desktopChannels: [
    { ext: null, label: null },
    { ext: 'dev', label: 'Dev' },
    { ext: 'beta', label: 'Beta' },
    { ext: 'nightly', label: 'Nightly' },
    { ext: 'development', label: 'Development' },
  ],

  // Android channel_constants.xml variants. relDir is the path under
  // brave/app/theme/brave/android/ that directly contains
  // channel_constants.xml (note: the "values" variant *is* the values
  // folder itself, unlike the res_brave_*_base variants which each have
  // their own nested values/ subfolder).
  // label: appended to the product name as " - <label>" for app_name.
  // null means the base/stable variant (no suffix).
  androidChannels: [
    { relDir: 'values', label: 'Debug' },
    { relDir: 'res_brave_base/values', label: null },
    { relDir: 'res_brave_default_base/values', label: 'Debug' },
    { relDir: 'res_brave_beta_base/values', label: 'Beta' },
    { relDir: 'res_brave_dev_base/values', label: 'Dev' },
    { relDir: 'res_brave_nightly_base/values', label: 'Nightly' },
  ],

  // Must match the `android_channel` GN arg in the active out/ dir's
  // args.gn, so the generator also restamps the build-consumed mirror at
  // chrome/android/java/res_chromium_base/values/channel_constants.xml.
  // (That file is normally refreshed by brave/build/commands/lib/branding.js
  // during `npm run build`; we stamp it directly here since this fork
  // builds Android via raw autoninja, which never runs that script.)
  activeAndroidChannelRelDir: 'res_brave_dev_base/values',

  // Must match whichever desktop channel was last built (the `npm run
  // build <channel>` argument), so the generator also restamps the
  // build-consumed mirror at chrome/app/theme/brave/BRANDING (which always
  // holds a single active channel's content, no extension).
  // null means the base/stable BRANDING file with no extension.
  activeDesktopChannelExt: 'development',
}
