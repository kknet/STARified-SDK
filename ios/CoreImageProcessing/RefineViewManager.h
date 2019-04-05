//
//  RefineViewManager.h
//  Starify
//
//  Created by Igor Zinovev on 30.10.2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#if __has_include(<React/RCTViewManager.h>)
#import <React/RCTViewManager.h>
#elif __has_include("RCTViewManager.h")
#import "RCTViewManager.h"
#else
#import "React/RCTViewManager.h"
#endif

@interface RefineViewManager : RCTViewManager

@end
