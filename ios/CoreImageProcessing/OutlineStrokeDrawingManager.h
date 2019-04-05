//
//  OutlintStrokeDrawingManager.h
//  outline_stroke_drawing_react
//
//  Created by Koretskiyil on 21/06/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#ifndef OutlintStrokeDrawingManager_h
#define OutlintStrokeDrawingManager_h


#if __has_include(<React/RCTViewManager.h>)
#import <React/RCTViewManager.h>
#elif __has_include("RCTViewManager.h")
#import "RCTViewManager.h"
#else
#import "React/RCTViewManager.h"
#endif

@interface OutlineStrokeDrawingManager : RCTViewManager

@end



#endif /* OutlintStrokeDrawingManager_h */
