//
//  MobileUnetSegmentation.m
//  StarifiedNative2
//
//  Created by Koretskiyil on 05/05/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

//
//  StarifiedSegmentation.m
//  StarifiedNative2
//
//  Created by Koretskiyil on 31/01/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "MobileUnetSegmentation.h"
#import "ImageBlender.h"

#import <StarifySDK/StarifySDK-Swift.h>

@interface MobileUnetSegmentation ()

@property MobileUnet* segmentation;

@end

@implementation MobileUnetSegmentation

RCT_EXPORT_MODULE()

- (instancetype)init
{
  if (self = [super init]) {
    self.segmentation = [[MobileUnet alloc] init];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(
                  processURL:(NSString*)url
                  callback:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    //UIImage * inputImage = [UIImage imageWithContentsOfFile:url ] ;
    NSString* outputFilename = [[url lastPathComponent] stringByDeletingLastPathComponent];
    NSString* outputFolderPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
    
    NSString * outputFilePath = [NSString stringWithFormat:@"%@/%@_processed.png", outputFolderPath, outputFilename];
    NSString * outputFileMaskPath = [NSString stringWithFormat:@"%@/%@_processed_mask.png", outputFolderPath, outputFilename];
    NSString * outputFileTransparentMaskPath = [NSString stringWithFormat:@"%@/%@_processed_mask_transparent.png", outputFolderPath, outputFilename];
    NSString * outputFileFeatheredPath = [NSString stringWithFormat:@"%@/%@_processed_feathered.png", outputFolderPath, outputFilename];
    
    NSArray * result = [self.segmentation processImageWithInputImagePath:url];
    
    UIImage* featheredImage = [ImageBlender blend:result[0]];
    
    [UIImagePNGRepresentation(result[0]) writeToFile:outputFilePath atomically:YES];
    [UIImagePNGRepresentation(result[1]) writeToFile:outputFileMaskPath atomically:YES];
    [UIImagePNGRepresentation(result[2]) writeToFile:outputFileTransparentMaskPath atomically:YES];
    [UIImagePNGRepresentation(featheredImage) writeToFile:outputFileFeatheredPath atomically:YES];

    callback(@[[NSNull null], outputFilePath, outputFileMaskPath, outputFileTransparentMaskPath, outputFileFeatheredPath ]);
  });
}


@end
