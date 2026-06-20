/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_VIEWS_BRAVE_ACTIONS_CAT_ACTION_BUTTON_H_
#define BRAVE_BROWSER_UI_VIEWS_BRAVE_ACTIONS_CAT_ACTION_BUTTON_H_

#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/toolbar/toolbar_button.h"
#include "ui/base/metadata/metadata_header_macros.h"

// A native toolbar button that, when clicked, animates a cat across the page.
class CatActionButton : public ToolbarButton {
  METADATA_HEADER(CatActionButton, ToolbarButton)
 public:
  explicit CatActionButton(BrowserWindowInterface* browser_window_interface);
  CatActionButton(const CatActionButton&) = delete;
  CatActionButton& operator=(const CatActionButton&) = delete;
  ~CatActionButton() override;

 private:
  void ButtonPressed();

  raw_ptr<BrowserWindowInterface> browser_window_interface_ = nullptr;
  base::WeakPtrFactory<CatActionButton> weak_ptr_factory_{this};
};

#endif  // BRAVE_BROWSER_UI_VIEWS_BRAVE_ACTIONS_CAT_ACTION_BUTTON_H_
