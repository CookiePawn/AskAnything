# template-cli

# Project Period

    Main APP DEV. 2025/05/03 ~
    Google Play Store Production Upload. 2025/06/06
    

## USING
> https://github.com/CookiePawn/template-cli.git
>
> Naver Search API


## Version
>## v0.0.4-c5
> [2025-06-06]
> - 스토어 버전 확인 추가
> - 로딩 애니메이션 수정
> - 결과 화면 출력부 수정
>


## React Native Cli 탬플릿
> 프로젝트명 변경 가능
>
> https://development-piece.tistory.com/462?category=1222088


## Project Start
```bash
npx @react-native-community/cli templatecli --version 0.77.0
```


## ENV 분기

[android]
> android/app/build.gradle 참조
> 
> android/settings.gradle 참조

[IOS]
> https://velog.io/@2ast/React-Native-개발용-Dev-앱-분리하기-ios
> 
> https://velog.io/@heumheum2/React-Native-Multiple-Environments

[create from root]
> .env.development
> 
> .env.production


## PROJECT SETTING
```bash
yarn
```
```bash
cd ios && pod install
```


## RUN PROJECT - Scripts
[android]
```bash
yarn run android:dev # DEVELOPMENT MODE
yarn run android:prod # PRODUCTION MODE
yarn run android:dev:release # DEVELOPMENT RELEASE MODE
yarn run android:prod:release # PRODUCTION RELEASE MODE
yarn run android:dev-apk # DEVELOPMENT APK
yarn run android:dev-aab # DEVELOPMENT BUNDLE
yarn run android:prod-apk # PRODUCTION APK
yarn run android:prod-aab # PRODUCTION BUNDLE
```

[IOS]
```bash
yarn run ios:dev # DEVELOPMENT MODE
yarn run ios:prod # PRODUCTION MODE
yarn run ios:dev:release # DEVELOPMENT RELEASE MODE
yarn run ios:prod:release # PRODUCTION RELEASE MODE
```


## Gradle Clean

```bash
cd android                                                                     
./gradlew clean
cd ..
yarn run ${scripts}
```
