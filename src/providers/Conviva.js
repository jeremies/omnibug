/**
 * Conviva
 * https://www.conviva.com/
 *
 * @class
 * @extends BaseProvider
 */
class ConvivaProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "CONVIVA";
        this._pattern    = /cws\.conviva\.com/;
        this._name       = "Conviva";
        this._type       = "analytics";
        this._keywords   = ["conviva", "cws"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "ck",
            "requestType": "omnibug_requestType"
        };
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "event_info",
                "name": "Event Info"
            }
        ];
    }

    /**
     * Parse a given URL into human-readable output
     *
     * @param {string}  rawUrl      A URL to check against
     * @param {string}  postData    POST data, if applicable
     *
     * @return {Array|{provider: {name: string, key: string, type: string}, data: Array}}
     */
    parseUrl(rawUrl, postData = "")
    {
        let url = new URL(rawUrl),
            parsedPayload = {};

        if (typeof postData === "string" && postData !== "") {
            try {
                parsedPayload = JSON.parse(postData);
            } catch (e) {
                // Not JSON or failed parsing
            }
        } else if (typeof postData === "object" && postData !== null) {
            parsedPayload = postData;
        }

        const events = parsedPayload.evs || parsedPayload.events || [];
        const globalData = [];
        const rootKeys = {
            "clid": "Client ID",
            "ck": "Customer Key",
            "sid": "Session ID",
            "seq": "Sequence Number",
            "st": "Session Start Time",
            "hbt": "Heartbeat Time",
            "vid": "Viewer ID",
            "aid": "Application ID",
            "ver": "SDK Version"
        };

        // Extract known root level tags/parameters
        Object.entries(rootKeys).forEach(([key, name]) => {
            if (parsedPayload[key] !== undefined && parsedPayload[key] !== null) {
                globalData.push({
                    "key": key,
                    "field": name,
                    "value": parsedPayload[key].toString(),
                    "group": "general"
                });
            }
        });

        // Extract other custom/unknown root level elements (ignoring event arrays)
        Object.entries(parsedPayload).forEach(([key, val]) => {
            if (key !== "evs" && key !== "events" && rootKeys[key] === undefined && val !== null && val !== undefined) {
                globalData.push({
                    "key": key,
                    "field": key,
                    "value": typeof val === "object" ? JSON.stringify(val) : val.toString(),
                    "group": "general"
                });
            }
        });

        // Add URL search params if present
        const params = new URLSearchParams(url.search);
        for(let param of params) {
            globalData.push({
                "key": param[0],
                "field": param[0],
                "value": param[1],
                "group": "general"
            });
        }

        // If there are no batched events, return a single row representing the heartbeat/ping request
        if (!Array.isArray(events) || events.length === 0) {
            return {
                "provider": {
                    "name":    this.name,
                    "key":     this.key,
                    "type":    this.type,
                    "columns": this.columnMapping,
                    "groups":  this.groups
                },
                "data": [
                    {
                        "key": "omnibug_requestType",
                        "value": "Heartbeat / Ping",
                        "hidden": true
                    },
                    ...globalData
                ]
            };
        }

        // Return an array of rows, one for each event!
        return events.map((event, index) => {
            const eventData = [...globalData];
            const eventType = event.t || event.name || "Event";

            eventData.push({
                "key": "omnibug_requestType",
                "value": eventType,
                "hidden": true
            });

            eventData.push({
                "key": "event_index",
                "field": "Event Index",
                "value": (index + 1).toString(),
                "group": "event_info"
            });

            // Map all event keys & values to the event_info group
            Object.entries(event).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    if (key === "p" || key === "attr") {
                        // Extract attributes inside sub-object/sub-array
                        Object.entries(val).forEach(([attrKey, attrVal]) => {
                            if (attrVal !== undefined && attrVal !== null) {
                                eventData.push({
                                    "key": `event_attr_${attrKey}`,
                                    "field": attrKey,
                                    "value": typeof attrVal === "object" ? JSON.stringify(attrVal) : attrVal.toString(),
                                    "group": "event_info"
                                });
                            }
                        });
                    } else {
                        // Standard event fields (t, st, name, time, etc.)
                        let fieldName = key;
                        if (key === "t" || key === "name") {
                            fieldName = "Event Name";
                        } else if (key === "st" || key === "time") {
                            fieldName = "Event Timestamp";
                        }
                        eventData.push({
                            "key": `event_${key}`,
                            "field": fieldName,
                            "value": typeof val === "object" ? JSON.stringify(val) : val.toString(),
                            "group": "event_info"
                        });
                    }
                }
            });

            return {
                "provider": {
                    "name":    this.name,
                    "key":     this.key,
                    "type":    this.type,
                    "columns": this.columnMapping,
                    "groups":  this.groups
                },
                "data": eventData
            };
        });
    }
}
