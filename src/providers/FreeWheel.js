/**
 * FreeWheel
 *
 * @class
 * @extends BaseProvider
 */
class FreeWheelProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "FREEWHEEL";
        this._pattern = /7db96\.v\.fwmrm\.net\/ad\/l\/1/;
        this._name = "FreeWheel";
        this._type = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            requestType: "cn"
        };
    }
}
