/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/brave_actions/cat_action_button.h"

#include "base/functional/bind.h"
#include "base/functional/callback.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "third_party/skia/include/core/SkBitmap.h"
#include "third_party/skia/include/core/SkCanvas.h"
#include "third_party/skia/include/core/SkPaint.h"
#include "third_party/skia/include/core/SkPathBuilder.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/gfx/image/image_skia.h"

namespace {

constexpr int kIconSize = 20;

gfx::ImageSkia CreateCatIcon() {
  SkBitmap bitmap;
  bitmap.allocN32Pixels(kIconSize, kIconSize);
  SkCanvas canvas(bitmap);
  canvas.clear(SK_ColorTRANSPARENT);

  SkPaint paint;
  paint.setAntiAlias(true);
  paint.setColor(SkColorSetARGB(210, 85, 85, 145));

  const float cx = kIconSize * 0.50f;
  const float cy = kIconSize * 0.57f;
  const float r  = kIconSize * 0.30f;

  // Head
  canvas.drawCircle(cx, cy, r, paint);

  // Left ear
  canvas.drawPath(
      SkPathBuilder()
          .moveTo(cx - r * 0.68f, cy - r * 0.42f)
          .lineTo(cx - r * 0.28f, cy - r * 1.08f)
          .lineTo(cx - r * 0.02f, cy - r * 0.42f)
          .close()
          .detach(),
      paint);

  // Right ear
  canvas.drawPath(
      SkPathBuilder()
          .moveTo(cx + r * 0.02f, cy - r * 0.42f)
          .lineTo(cx + r * 0.28f, cy - r * 1.08f)
          .lineTo(cx + r * 0.68f, cy - r * 0.42f)
          .close()
          .detach(),
      paint);

  return gfx::ImageSkia::CreateFrom1xBitmap(bitmap);
}

// Big 🐱 sways left↔right in the center of the screen for 5 s.
// Uses ease-in-out for pendulum feel; flips (scaleX) at each turning point.
constexpr char16_t kCatScript[] =
    u"(function(){"
    u"if(document.getElementById('__isk_cat__'))return;"
    u"var s=document.createElement('style');"
    u"s.id='__isk_cat_s__';"
    u"s.textContent="
    u"'@keyframes isk_swing{"
    u"0%{transform:translateY(-50%) translateX(-200px) scaleX(1)}"
    u"49%{transform:translateY(-50%) translateX(200px) scaleX(1)}"
    u"50%{transform:translateY(-50%) translateX(200px) scaleX(-1)}"
    u"99%{transform:translateY(-50%) translateX(-200px) scaleX(-1)}"
    u"100%{transform:translateY(-50%) translateX(-200px) scaleX(1)}"
    u"}';"
    u"document.head.appendChild(s);"
    u"var d=document.createElement('div');"
    u"d.id='__isk_cat__';"
    u"d.textContent='\U0001F431';"
    u"d.style.cssText="
    u"'position:fixed;top:50%;left:50%;margin-left:-130px;"
    u"z-index:2147483647;font-size:260px;pointer-events:none;line-height:1;"
    u"animation:isk_swing 2s ease-in-out infinite';"
    u"document.body.appendChild(d);"
    u"setTimeout(function(){d.remove();s.remove();},5000);"
    u"})();";

}  // namespace

CatActionButton::CatActionButton(
    BrowserWindowInterface* browser_window_interface)
    : ToolbarButton(base::BindRepeating(&CatActionButton::ButtonPressed,
                                        base::Unretained(this))),
      browser_window_interface_(browser_window_interface) {
  SetImageModel(ButtonState::STATE_NORMAL,
                ui::ImageModel::FromImageSkia(CreateCatIcon()));
  SetTooltipText(u"\U0001F431 Кот");
  SetAccessibleName(u"Кот");
}

CatActionButton::~CatActionButton() = default;

void CatActionButton::ButtonPressed() {
  auto* web_contents =
      browser_window_interface_->GetTabStripModel()->GetActiveWebContents();
  if (!web_contents) {
    return;
  }
  content::RenderFrameHost::AllowInjectingJavaScript();
  web_contents->GetPrimaryMainFrame()->ExecuteJavaScript(
      kCatScript, base::NullCallback());
}

BEGIN_METADATA(CatActionButton)
END_METADATA
