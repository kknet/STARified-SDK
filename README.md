# How to run

Install JS packages, iOS pods and run Xcode xcworkspace

```
yarn install
cd ios
pod install
```

Run packager

```
npm start
```

Run emulator

```
open ios/starified.xcworkspace
```

Runing packager by hand is a temp solution. In release mode you don't have to do it

TODO: Return carousel from npm as https://github.com/archriss/react-native-snap-carousel/issues/492 will be fixed.

## NSNotification types

Use this constants as NSNotification names:

``"StarifiedImageRendered"`` for image, userInfo payload contains image uri
``"StarifiedVideoRendered"`` for video, userInfo payload contains video uri
``"StarifiedClosingRequest"`` for Starified closing request, with empty userInfo payload

## How to post NSNotification from JS side

1. Import NotificationManager in your JS file

```javascript
var NotificationManager = require('react-native').NativeModules.NotificationManager;
```

2. Post notification with notification type (string) and payload (dictionary).

**Payload is required, use empty object if there is no usefull dictionary**

```javascript
NotificationManager.postNotification("StarifiedImageRendered", { uri })
```

## How to post NSNotification from native side

```objective-c
  [[NSNotificationCenter defaultCenter] postNotificationName:@"StarifiedImageRendered"
                                                      object:nil
                                                    userInfo:userInfo];
```

## How to fetch NSNotification on native side

1. Create handler function

```objective-c
- (void)handleStarfiedNotification:(NSNotification *)notification
{
    // DO STUFF HERE
}
```

2. Subscribe for needed notification type (name), use your handler ('handleStarfiedNotification' in this example)

```objective-c
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleStarfiedNotification:)
                                               name:@"StarifiedImageRendered"
                                             object:nil];

```

3. Remove observer on class destroing

```objective-c
  [[NSNotificationCenter defaultCenter] removeObserver:self];
```
