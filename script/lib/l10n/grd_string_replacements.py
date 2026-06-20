#!/usr/bin/env python3
#
# Copyright (c) 2022 The Brave Authors. All rights reserved.
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/. */


# Strings we want to replace but that we also replace automatically
# for XTB files
branding_replacements = [
    (r'The\sChromium\sAuthors.\sAll\srights\sreserved.',
     r'The Iskra Authors. All rights reserved.'),
    (r'Google\sLLC.\sAll\srights\sreserved.',
     r'The Iskra Authors. All rights reserved.'),
    (r'The\sChromium\sAuthors', r'Iskra Software'),
    (r'Google\sChrome', r'Iskra'),
    (r'(Google)(?!\sPlay)', r'Iskra'),
    (r'Chromium', r'Iskra'),
    (r'Chrome', r'Iskra'),
    (r'क्रोमियम', r'Iskra'),  # Chromium in Hindi
]


# Strings we want to replace but that we need to use Crowdin for
# to translate the XTB files
default_replacements = [
    (r'Iskra Web Store', r'Web Store'),
    (r'You\'re incognito', r'This is a private window'),
    (r'an incognito', r'a private'),
    (r'an Incognito', r'a Private'),
    (r'incognito', r'private'),
    (r'Incognito', r'Private'),
    (r'inco&gnito', r'&private'),
    (r'Inco&gnito', r'&Private'),
]


# Fix up some strings after aggressive first round replacement.
fixup_replacements = [
    (r'Iskra Cloud Print', r'Google Cloud Print'),
    (r'Iskra Docs', r'Google Docs'),
    (r'Iskra Drive', r'Google Drive'),
    (r'Iskra OS', r'Chrome OS'),
    (r'IskraOS', r'ChromeOS'),
    (r'Iskra Safe Browsing', r'Google Safe Browsing'),
    (r'Safe Browsing \(protects you and your device from dangerous sites\)',
     r'Google Safe Browsing (protects you and your device from dangerous sites)'
     ),
    (r'Sends URLs of some pages you visit to Iskra',
     r'Sends URLs of some pages you visit to Google'),
    (r'Google Google', r'Google'),
    (r'Iskra Account', r'Iskra sync chain'),
    (r'Iskra Lens', r'Google Lens'),
    (r'Iskrabook', r'Chromebook'),
    (r'Iskracast', r'Chromecast'),
    (r'Iskra Cloud', r'Google Cloud'),
    (r'Iskra Pay', r'Google Pay'),
    (r'Iskra Photos', r'Google Photos'),
    (r'Iskra Projects', r'Chromium Projects'),
    (r'Iskra Root Program', r'Chrome Root Program'),
    (r'IskraVox', r'ChromeVox'),
    (r'powered by Iskra AI', r'powered by Google AI'),
    (r'Iskra Extension developer documentation',
     r'Google Extension developer documentation'),
]


# Replacements for text nodes and neither for inside descriptions nor comments
main_text_only_replacements = [
    # By converting it back first, it makes this idempotent
    ('Copyright \xa9', 'Copyright'),
    ('Copyright', 'Copyright \xa9'),
]


# Replacements for strings in brave_strings.grd for situations where using a
# different GRD would be impractical. These need to be translated in Crowdin.
brave_strings_grd_replacements = [
    ('IDS_LOCAL_NETWORK_ACCESS_PERMISSION_DESC', r'''
          This will allow you to share content from Iskra to your local devices, such as a TV or speaker.
        '''),
]
