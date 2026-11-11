import test from 'ava';

import { createElement, clearStyles, clearChildren, getDataColumnValue } from "./../source/helpers.js";

/*
 * --------- createElement ---------------------------------------------------------------------------------------------
 */
test("createElement should return an HTML Element", t => {
    let element = createElement("div");
    t.is(typeof element, "object");
    t.true(element instanceof HTMLElement);
});

test("createElement should add classes, if passed", t => {
    let elementWithoutClasses = createElement("div"),
        elementWithOneClass = createElement("div", {
            "classes": ["foo"]
        }),
        elementWithTwoClasses = createElement("div", {
            "classes": ["foo", "bar"]
        });

    t.is(elementWithoutClasses.classList.length, 0);

    t.is(elementWithOneClass.classList.length, 1);
    t.true(elementWithOneClass.classList.contains("foo"));

    t.is(elementWithTwoClasses.classList.length, 2);
    t.true(elementWithTwoClasses.classList.contains("foo"));
    t.true(elementWithTwoClasses.classList.contains("bar"));
});

test("createElement should add a single class, if passed as a string", t => {
    let elementWithoutClasses = createElement("div"),
        elementWithOneClass = createElement("div", {
            "classes": "foo"
        });

    t.is(elementWithoutClasses.classList.length, 0);

    t.is(elementWithOneClass.classList.length, 1);
    t.true(elementWithOneClass.classList.contains("foo"));
});

test("createElement should add attributes, if passed", t => {
    let elementWithoutAttributes = createElement("div"),
        elementWithOneAttribute = createElement("div", {
            "attributes": {
                "title": "foobar"
            }
        }),
        elementWithTwoAttributes = createElement("div", {
            "attributes": {
                "title": "foobar",
                "data-test": "testing123"
            }
        });

    t.false(elementWithoutAttributes.hasAttributes());

    t.true(elementWithOneAttribute.hasAttributes());
    t.is(elementWithOneAttribute.getAttributeNames().length, 1);
    t.is(elementWithOneAttribute.getAttribute("title"), "foobar");

    t.true(elementWithTwoAttributes.hasAttributes());
    t.is(elementWithTwoAttributes.getAttributeNames().length, 2);
    t.is(elementWithTwoAttributes.getAttribute("title"), "foobar");
    t.is(elementWithTwoAttributes.getAttribute("data-test"), "testing123");
});

test("createElement should add text, if passed", t => {
    let elementWithoutText = createElement("div"),
        elementWithText = createElement("div", {
            "text": "foobar"
        });

    t.is(elementWithoutText.textContent, "");
    t.is(elementWithText.textContent, "foobar");
});

test("createElement should add children, if passed", t => {
    let elementWithoutChildren = createElement("div"),
        child1 = createElement("div"),
        child2 = createElement("div"),
        elementWithChildren = createElement("div", {
            "children": [child1, child2]
        });

    t.is(elementWithoutChildren.children.length, 0);
    t.is(elementWithChildren.children.length, 2);
    t.is(elementWithChildren.children[0], child1, "Children should be added in the order provided");
});

test("createElement should add a child, if passed", t => {
    let elementWithoutChildren = createElement("div"),
        child1 = createElement("div"),
        elementWithChildren = createElement("div", {
            "children": child1
        });

    t.is(elementWithoutChildren.children.length, 0);
    t.is(elementWithChildren.children.length, 1);
});

test("createElement should ignore if item not an HTML Element", t => {
    let elementWithoutChildren = createElement("div"),
        child1 = createElement("div"),
        child2 = {"foo": "bar"},
        elementWithChildren = createElement("div", {
            "children": [child1, child2]
        });

    t.is(elementWithoutChildren.children.length, 0);
    t.is(elementWithChildren.children.length, 1);
});

test("createElement should add classes, attributes, children, and text if passed", t => {
    let child1 = createElement("div"),
        child2 = createElement("div"),
        parentElement = createElement("div", {
            "classes": ["testing", "foobar"],
            "attributes": {
                "title": "example title",
                "data-foo": "bar"
            },
            "text": "foobar",
            "children": [child1, child2]
        });

    // Classes
    t.true(parentElement.classList.contains("testing"));
    t.true(parentElement.classList.contains("foobar"));

    // Attributes
    t.is(parentElement.getAttributeNames().length, 3); // 2 attributes passed + class
    t.is(parentElement.getAttribute("title"), "example title");
    t.is(parentElement.getAttribute("data-foo"), "bar");

    // Text
    t.is(parentElement.textContent, "foobar");

    // Children
    t.is(parentElement.children.length, 2);
});

/*
 * --------- clearStyles -----------------------------------------------------------------------------------------------
 */
test("clearStyles should remove all styles in a given stylesheet", t => {
    let styleSheet = document.createElement("style");
    document.body.appendChild((styleSheet));
    styleSheet.sheet.insertRule("body { color: red; }" , styleSheet.sheet.cssRules.length);
    styleSheet.sheet.insertRule("div { color: blue; }" , styleSheet.sheet.cssRules.length);
    styleSheet.sheet.insertRule("body { color: red; }" , styleSheet.sheet.cssRules.length);

    t.is(styleSheet.sheet.cssRules.length, 3);
    clearStyles(styleSheet);
    t.is(styleSheet.sheet.cssRules.length, 0);
});

test("clearStyles should do nothing when passed an empty stylesheet", t => {
    let styleSheet = document.createElement("style");
    document.body.appendChild((styleSheet));

    clearStyles(styleSheet);
    t.is(styleSheet.sheet.cssRules.length, 0);
});

test("clearStyles should throw an error when passed a non-stylesheet element", t => {
    let nonStyleSheet = document.createElement("div");
    const error = t.throws(() => {
        clearStyles(nonStyleSheet);
    }, TypeError);

    t.is(error.message, "Parameter is not a stylesheet");
});

/*
 * --------- clearChildren ---------------------------------------------------------------------------------------------
 */
test("clearChildren should remove all children of an element passed", t => {
    let parentElement = document.createElement("div"),
        child1 = document.createElement("div"),
        child2 = document.createElement("div");

    parentElement.appendChild(child1);
    parentElement.appendChild(child2);


    t.is(parentElement.children.length, 2);
    clearChildren(parentElement);
    t.is(parentElement.children.length, 0);
});

test("clearChildren should throw an error when passed a non-HTML element", t => {
    let nonElement = {"foo": "bar"};
    const error = t.throws(() => {
        clearChildren(nonElement);
    }, TypeError);

    t.is(error.message, "Parameter is not an HTMLElement");
});

/*
 * --------- getDataColumnValue ----------------------------------------------------------------------------------------
 */
test("getDataColumnValue should return direct parameter value", t => {
    let request = {
        "data": [
            { "field": "Events", "value": "event1" },
            { "field": "Page Name", "value": "Home" }
        ]
    };

    t.is(getDataColumnValue("Events", request), "event1");
    t.is(getDataColumnValue("Page Name", request), "Home");
    t.is(getDataColumnValue("Missing", request), "");
    t.is(getDataColumnValue("", request), "");
    t.is(getDataColumnValue("Events", {}), "");
});

test("getDataColumnValue should extract JSON keys using dot notation", t => {
    let request = {
        "data": [
            {
                "field": "param1",
                "value": JSON.stringify({
                    "subparam2": "value2",
                    "nested": {
                        "subsubparam3": "value3"
                    }
                })
            }
        ]
    };

    t.is(getDataColumnValue("param1.subparam2", request), "value2");
    t.is(getDataColumnValue("param1.nested.subsubparam3", request), "value3");
    t.is(getDataColumnValue("param1.nested.missing", request), "");
});

test("getDataColumnValue should extract nested stringified JSON values", t => {
    let request = {
        "data": [
            {
                "field": "param1",
                "value": JSON.stringify({
                    "subparam2": JSON.stringify({
                        "subsubparam3": "value3"
                    })
                })
            }
        ]
    };

    t.is(getDataColumnValue("param1.subparam2.subsubparam3", request), "value3");
});

test("getDataColumnValue should extract JSON keys with dots using bracket notation", t => {
    let request = {
        "data": [
            {
                "field": "param1",
                "value": JSON.stringify({
                    "sub.param.2": {
                        "sub.sub.param.3": "value3"
                    },
                    "quote\"key": "quotedValue"
                })
            }
        ]
    };

    t.is(getDataColumnValue("param1[\"sub.param.2\"][\"sub.sub.param.3\"]", request), "value3");
    t.is(getDataColumnValue("param1['sub.param.2']['sub.sub.param.3']", request), "value3");
    t.is(getDataColumnValue("param1[\"quote\\\"key\"]", request), "quotedValue");
});

test("getDataColumnValue should support mixed dot, bracket, and array index paths", t => {
    let request = {
        "data": [
            {
                "field": "param1",
                "value": JSON.stringify({
                    "items": [
                        { "id": 10, "meta.info": { "label": "First" } },
                        { "id": 20, "meta.info": { "label": "Second" } }
                    ]
                })
            }
        ]
    };

    t.is(getDataColumnValue("param1.items[0].id", request), "10");
    t.is(getDataColumnValue("param1.items[1][\"meta.info\"].label", request), "Second");
    t.is(getDataColumnValue("param1.items[5].id", request), "");
});

test("getDataColumnValue should support base parameter names containing dots or brackets", t => {
    let request = {
        "data": [
            {
                "field": "events[0].xdm.data",
                "value": JSON.stringify({ "subparam2": "value2" })
            },
            {
                "field": "my.dotted.param",
                "value": JSON.stringify({ "key": "dottedVal" })
            }
        ]
    };

    t.is(getDataColumnValue("events[0].xdm.data", request), "{\"subparam2\":\"value2\"}");
    t.is(getDataColumnValue("events[0].xdm.data.subparam2", request), "value2");
    t.is(getDataColumnValue("my.dotted.param.key", request), "dottedVal");
    t.is(getDataColumnValue("[\"my.dotted.param\"].key", request), "dottedVal");
});

test("getDataColumnValue should format non-string values and handle invalid JSON or paths", t => {
    let request = {
        "data": [
            {
                "field": "param1",
                "value": JSON.stringify({
                    "num": 42,
                    "bool": false,
                    "nil": null,
                    "obj": { "a": 1 },
                    "arr": [1, 2]
                })
            },
            {
                "field": "notJson",
                "value": "plain text"
            }
        ]
    };

    t.is(getDataColumnValue("param1.num", request), "42");
    t.is(getDataColumnValue("param1.bool", request), "false");
    t.is(getDataColumnValue("param1.nil", request), "");
    t.is(getDataColumnValue("param1.obj", request), "{\"a\":1}");
    t.is(getDataColumnValue("param1.arr", request), "[1,2]");
    t.is(getDataColumnValue("notJson.sub", request), "");
    t.is(getDataColumnValue("param1..num", request), "");
    t.is(getDataColumnValue("param1[\"unclosed]", request), "");
});