import test from "ava";

import { default as FreeWheelProvider } from "./../source/providers/FreeWheel.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic FreeWheel Provider Information", t => {
  let provider = new FreeWheelProvider();
  t.is(provider.key, "FREEWHEEL", "Key should always be FREEWHEEL");
  t.is(provider.type, "Marketing", "Type should always be marketing");
  t.true(
    typeof provider.name === "string" && provider.name !== "",
    "Name should exist"
  );
  t.true(
    typeof provider.pattern === "object" && provider.pattern instanceof RegExp,
    "Pattern should be a RegExp value"
  );
});

test("Pattern should match FreeWheel event requests", t => {
  let provider = new FreeWheelProvider(),
    url = "https://7db96.v.fwmrm.net/ad/l/1?s=123&p=456";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns FreeWheelProvider", t => {
  let url = "https://7db96.v.fwmrm.net/ad/l/1?s=123&p=456";

  let results = OmnibugProvider.parseUrl(url);
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "FREEWHEEL", "Results provider is FreeWheel");
});
