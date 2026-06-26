import test from 'ava';

import { default as ConvivaProvider } from "./../source/providers/Conviva.js";
import { OmnibugProvider } from "./../source/providers.js";

test("ConvivaProvider returns provider information", (t) => {
    let provider = new ConvivaProvider();
    t.is(provider.key, "CONVIVA", "Key should always be CONVIVA");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("ConvivaProvider pattern should match Conviva calls", t => {
    let provider = new ConvivaProvider(),
        urls = [
            "https://cws.conviva.com/0/w",
            "https://example.cws.conviva.com/0/w",
            "http://cws.conviva.com/ping"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns Conviva single heartbeat", t => {
    let url = "https://cws.conviva.com/0/w",
        postData = "{\"ck\":\"test_customer_key\",\"clid\":\"12345\",\"sid\":\"67890\"}";

    let results = OmnibugProvider.parseUrl(url, postData);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "CONVIVA", "Results provider is Conviva");
    
    let reqType = results.data.find(r => r.key === "omnibug_requestType");
    t.is(reqType.value, "Heartbeat / Ping");
});

test("OmnibugProvider returns Conviva multiple events", t => {
    let url = "https://cws.conviva.com/0/w",
        postData = "{\"ck\":\"test_customer_key\",\"clid\":\"12345\",\"evs\":[{\"t\":\"playing\",\"st\":1000,\"p\":{\"bitrate\":4500}},{\"t\":\"buffering\",\"st\":2000}]}";

    let results = OmnibugProvider.parseUrl(url, postData);
    t.true(Array.isArray(results), "Results is an array of event objects");
    t.is(results.length, 2, "Should return 2 rows/events");

    t.is(results[0].provider.key, "CONVIVA");
    let reqType1 = results[0].data.find(r => r.key === "omnibug_requestType");
    t.is(reqType1.value, "playing");

    let eventIndex1 = results[0].data.find(r => r.key === "event_index");
    t.is(eventIndex1.value, "1");

    let bitrate = results[0].data.find(r => r.key === "event_attr_bitrate");
    t.is(bitrate.value, "4500");

    t.is(results[1].provider.key, "CONVIVA");
    let reqType2 = results[1].data.find(r => r.key === "omnibug_requestType");
    t.is(reqType2.value, "buffering");

    let eventIndex2 = results[1].data.find(r => r.key === "event_index");
    t.is(eventIndex2.value, "2");
});
