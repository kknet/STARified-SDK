//
//  OutlineStrokeDrawingView.h
//  outline_stroke_drawing_react
//
//  Created by Koretskiyil on 21/06/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#ifndef OutlineStrokeDrawingView_h
#define OutlineStrokeDrawingView_h


// import RCTView.h
#if __has_include(<React/RCTView.h>)
#import <React/RCTView.h>
#elif __has_include("RCTView.h")
#import "RCTView.h"
#else
#import "React/RCTView.h"
#endif

@interface OutlineStrokeDrawingView : RCTView

@property (nonatomic, strong) NSString *imageName;
@property (nonatomic, strong) NSArray *layers;
@property (nonatomic, strong) UIImage *resultImage;

- (UIImage*) getStrokesImage;

@end


#endif /* OutlineStrokeDrawingView_h */
