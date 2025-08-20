"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validators = exports.errors = exports.Config = exports.adapters = void 0;
const adapters = __importStar(require("./adapters"));
exports.adapters = adapters;
const config_1 = __importDefault(require("./config"));
exports.Config = config_1.default;
const errors = __importStar(require("./errors"));
exports.errors = errors;
const filterer_1 = __importDefault(require("./orchestrators/filterer"));
const not_implemented_1 = __importDefault(require("./errors/not_implemented"));
const pager_1 = __importDefault(require("./orchestrators/pager"));
const schema_1 = __importDefault(require("./schema"));
const sorter_1 = __importDefault(require("./orchestrators/sorter"));
const validators = __importStar(require("./validators/querier"));
exports.validators = validators;
class QueryQL {
    constructor(query, builder, config = {}) {
        this.query = query;
        this.builder = builder;
        this.config = new config_1.default(config);
        const AdapterCtor = this.config.get('adapter');
        this.adapter = new AdapterCtor();
        this.schema = new schema_1.default();
        this.defineSchema(this.schema);
        this.filterer = new filterer_1.default(this);
        this.sorter = new sorter_1.default(this);
        this.pager = new pager_1.default(this);
        const ValidatorCtor = this.config.get('validator');
        this.validator = new ValidatorCtor(this.defineValidation.bind(this));
    }
    defineSchema(schema) {
        throw new not_implemented_1.default();
    }
    defineValidation(...args) {
        return undefined;
    }
    get defaultFilter() {
        return undefined;
    }
    get defaultSort() {
        return undefined;
    }
    get defaultPage() {
        return undefined;
    }
    get filterDefaults() {
        return undefined;
    }
    get sortDefaults() {
        return undefined;
    }
    get pageDefaults() {
        return undefined;
    }
    validate() {
        return (this.filterer.validate() &&
            this.sorter.validate() &&
            this.pager.validate());
    }
    run() {
        this.validate();
        this.filterer.run();
        this.sorter.run();
        this.pager.run();
        return this.builder;
    }
}
// Attach helpers as static properties to match existing runtime API/tests
(function (QueryQL) {
})(QueryQL || (QueryQL = {}));
QueryQL.adapters = adapters;
QueryQL.Config = config_1.default;
QueryQL.errors = errors;
QueryQL.validators = validators;
exports.default = QueryQL;
