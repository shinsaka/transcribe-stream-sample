# Amazon Transcribe Stream Sample

## about

- read a local file raw PCM Signed 16bits (header-less)
- send an audio stream to Amazon Transcribe Stream Service
- recieve a stream transcription text
- output to stdout

- impremented with AWS SDK for JavaScript version 3(preview)
  - https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html

## prepare

```
$ npm install
```

# execute

```
$ node transcription.js audio.raw
```

