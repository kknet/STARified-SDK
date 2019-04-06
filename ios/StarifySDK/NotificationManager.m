//
//  NotificationManager.m
//  starified
//
//  Created by Damik Minnegalimov on 04/04/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NotificationManager.h"
#import <React/RCTEventEmitter.h>

@implementation NotificationManager

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(postNotification:(NSString *)name withUserInfo:(NSDictionary *)userInfo)
{
  [[NSNotificationCenter defaultCenter] postNotificationName:name
                                                      object:nil
                                                    userInfo:userInfo];
  
  NSLog(@"Post NSNotification with name <%@> and userInfo: %@", name, userInfo);
}

@end
