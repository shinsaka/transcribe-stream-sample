const { stdout } = require('process');
const { createReadStream } = require('fs');
const { Readable, Transform } = require('stream');
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require('@aws-sdk/client-transcribe-streaming');
const { NodeHttp2Handler } = require('@aws-sdk/node-http-handler');

const parseTranscribeStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, cb) {
        if (chunk.TranscriptEvent && chunk.TranscriptEvent.Transcript) {
            const results = chunk.TranscriptEvent.Transcript.Results;
            if (results.length > 0 && results[0].Alternatives.length > 0 && !results[0].IsPartial) {
                this.push(`${results[0].Alternatives[0].Items[0].StartTime}: ${results[0].Alternatives[0].Transcript}\n`);
            }
        }
        cb();
    }
});

(async () => {
    const audioSource = createReadStream(process.argv[2], {
        highWaterMark: 1024
    });

    const audioStream = async function* () {
        for await (const payloadChunk of audioSource) {
            yield { AudioEvent: { AudioChunk: payloadChunk } };
        }
    };

    const command = new StartStreamTranscriptionCommand({
        LanguageCode: 'ja-JP',
        MediaEncoding: 'pcm',
        MediaSampleRateHertz: 8000,
        AudioStream: audioStream()
    });

    const client = new TranscribeStreamingClient({
        requestHandler: new NodeHttp2Handler({sessionTimeout: 5000})
    });

    const response = await client.send(command);
    const transcriptsStream = Readable.from(response.TranscriptResultStream);

    transcriptsStream.pipe(parseTranscribeStream).pipe(stdout);
})();
