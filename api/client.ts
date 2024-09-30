export interface paths {
    "/api/accounts/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"][];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        name?: string;
                        key?: string;
                        address?: string;
                        /** Format: uuid */
                        logoBlobId?: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/accounts/{accountId}/apply-template/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/blobs/{blobId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    blobId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/fields/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            fieldId: string;
                            templateId: string | null;
                            name: string;
                            description: string | null;
                            /** @enum {string} */
                            type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                            /** @enum {string|null} */
                            resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                            defaultValue: {
                                address: {
                                    streetAddress: string | null;
                                    city: string | null;
                                    state: string | null;
                                    zip: string | null;
                                    country: string | null;
                                } | null;
                                boolean: boolean | null;
                                contact: {
                                    name: string | null;
                                    title: string | null;
                                    email: string | null;
                                    phone: string | null;
                                } | null;
                                /** Format: date-time */
                                date: string | null;
                                number: number | null;
                                option: {
                                    id: string;
                                    name: string;
                                    templateId: string | null;
                                } | null;
                                options: {
                                    id: string;
                                    name: string;
                                    templateId: string | null;
                                }[];
                                string: string | null;
                                user: {
                                    id: string;
                                    accountId: string;
                                    firstName: string | null;
                                    lastName: string | null;
                                    fullName: string | null;
                                    email: string;
                                    profilePicPath: string | null;
                                    /** Format: date-time */
                                    tsAndCsSignedAt: string | null;
                                    isAdmin: boolean;
                                    isApprover: boolean;
                                    isGlobalAdmin: boolean;
                                } | null;
                                file: {
                                    id: string;
                                    accountId: string;
                                    blobId: string;
                                    name: string;
                                    contentType: string;
                                    downloadPath: string;
                                    previewPath: string;
                                } | null;
                                files: {
                                    id: string;
                                    accountId: string;
                                    blobId: string;
                                    name: string;
                                    contentType: string;
                                    downloadPath: string;
                                    previewPath: string;
                                }[];
                                resource: {
                                    id: string;
                                    /** @enum {string} */
                                    type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                    templateId: string | null;
                                    name: string;
                                    key: number;
                                } | null;
                                /** Format: date-time */
                                updatedAt: string;
                            } | null;
                            defaultToToday: boolean;
                            isRequired: boolean;
                            options: {
                                id: string;
                                name: string;
                                templateId: string | null;
                            }[];
                        }[];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        /** @enum {string} */
                        type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                        /** @enum {string} */
                        resourceType?: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                        isRequired: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/fields/{fieldId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    fieldId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    fieldId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        description: string | null;
                        options: ({
                            id: string;
                            name: string;
                        } & ({
                            /** @enum {string} */
                            op: "add";
                        } | {
                            /** @enum {string} */
                            op: "update";
                            optionId: string;
                        } | {
                            /** @enum {string} */
                            op: "remove";
                            optionId: string;
                        }))[];
                        /** @enum {string|null} */
                        resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                        isRequired: boolean;
                        defaultValue?: {
                            address?: {
                                streetAddress: string | null;
                                city: string | null;
                                state: string | null;
                                zip: string | null;
                                country: string | null;
                            } | null;
                            boolean?: boolean | null;
                            contact?: {
                                name: string | null;
                                title: string | null;
                                email: string | null;
                                phone: string | null;
                            } | null;
                            /** Format: date-time */
                            date?: string | null;
                            number?: number | null;
                            /** Format: uuid */
                            optionId?: string | null;
                            optionIds?: string[];
                            string?: string | null;
                            /** Format: uuid */
                            userId?: string | null;
                            /** Format: uuid */
                            fileId?: string | null;
                            fileIds?: string[];
                            /** Format: uuid */
                            resourceId?: string | null;
                        };
                        defaultToToday?: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/mcmaster/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: date-time */
                            connectedAt: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/mcmaster/create-punchout-session/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uri */
                            url: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/mcmaster/connect/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/mcmaster/disconnect/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/mcmaster/process-poom/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string;
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/plaid/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            accounts: {
                                id: string;
                                name: string;
                            }[];
                            /** Format: date-time */
                            connectedAt: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/plaid/integrations/plaid/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/plaid/link-token/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": string;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/quickbooks/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uri */
                            setupUrl: string;
                            connection: {
                                companyName: string;
                                realmId: string;
                                /** Format: date-time */
                                connectedAt: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/quickbooks/bills/{billResourceId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    billResourceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            success: boolean;
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/quickbooks/connect/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query: {
                    url: string;
                };
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/quickbooks/disconnect/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/integrations/quickbooks/pull-data/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                    where?: components["schemas"]["JsonLogic"];
                };
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            templateId: string | null;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            key: number;
                            fields: {
                                fieldId: string;
                                /** @enum {string} */
                                fieldType: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                name: string;
                                templateId: string | null;
                                value: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                };
                            }[];
                            costs: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                isPercentage: boolean;
                                value: number;
                            }[];
                        }[];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                        fields?: {
                            /** Format: uuid */
                            fieldId: string;
                            valueInput: {
                                address?: {
                                    streetAddress: string | null;
                                    city: string | null;
                                    state: string | null;
                                    zip: string | null;
                                    country: string | null;
                                } | null;
                                boolean?: boolean | null;
                                contact?: {
                                    name: string | null;
                                    title: string | null;
                                    email: string | null;
                                    phone: string | null;
                                } | null;
                                /** Format: date-time */
                                date?: string | null;
                                number?: number | null;
                                /** Format: uuid */
                                optionId?: string | null;
                                optionIds?: string[];
                                string?: string | null;
                                /** Format: uuid */
                                userId?: string | null;
                                /** Format: uuid */
                                fileId?: string | null;
                                fileIds?: string[];
                                /** Format: uuid */
                                resourceId?: string | null;
                            };
                        }[];
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            templateId: string | null;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            key: number;
                            fields: {
                                fieldId: string;
                                /** @enum {string} */
                                fieldType: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                name: string;
                                templateId: string | null;
                                value: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                };
                            }[];
                            costs: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                isPercentage: boolean;
                                value: number;
                            }[];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/find-by-name-or-po-number/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                    input: string;
                    exact?: boolean;
                };
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            templateId: string | null;
                            name: string;
                            key: number;
                        }[];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/find-backlinks/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                    resourceId: string;
                };
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            templateId: string | null;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            key: number;
                            fields: {
                                fieldId: string;
                                /** @enum {string} */
                                fieldType: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                name: string;
                                templateId: string | null;
                                value: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                };
                            }[];
                            costs: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                isPercentage: boolean;
                                value: number;
                            }[];
                        }[];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/head/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                    resourceKey: number;
                };
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            key: number;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/{resourceId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            templateId: string | null;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            key: number;
                            fields: {
                                fieldId: string;
                                /** @enum {string} */
                                fieldType: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                name: string;
                                templateId: string | null;
                                value: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                };
                            }[];
                            costs: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                isPercentage: boolean;
                                value: number;
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** Format: uuid */
                        fieldId: string;
                        valueInput: {
                            address?: {
                                streetAddress: string | null;
                                city: string | null;
                                state: string | null;
                                zip: string | null;
                                country: string | null;
                            } | null;
                            boolean?: boolean | null;
                            contact?: {
                                name: string | null;
                                title: string | null;
                                email: string | null;
                                phone: string | null;
                            } | null;
                            /** Format: date-time */
                            date?: string | null;
                            number?: number | null;
                            /** Format: uuid */
                            optionId?: string | null;
                            optionIds?: string[];
                            string?: string | null;
                            /** Format: uuid */
                            userId?: string | null;
                            /** Format: uuid */
                            fileId?: string | null;
                            fileIds?: string[];
                            /** Format: uuid */
                            resourceId?: string | null;
                        };
                    }[];
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            templateId: string | null;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            key: number;
                            fields: {
                                fieldId: string;
                                /** @enum {string} */
                                fieldType: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                name: string;
                                templateId: string | null;
                                value: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                };
                            }[];
                            costs: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                isPercentage: boolean;
                                value: number;
                            }[];
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/{resourceId}/clone/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            templateId: string | null;
                            /** @enum {string} */
                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            key: number;
                            fields: {
                                fieldId: string;
                                /** @enum {string} */
                                fieldType: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                name: string;
                                templateId: string | null;
                                value: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                };
                            }[];
                            costs: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                isPercentage: boolean;
                                value: number;
                            }[];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/{resourceId}/costs/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/resources/{resourceId}/costs/{costId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                    costId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceId: string;
                    costId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        name?: string;
                        isPercentage?: boolean;
                        value?: number;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/accounts/{accountId}/schemas/{resourceType}/merged/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            sections: {
                                id: string;
                                name: string;
                                fields: {
                                    fieldId: string;
                                    templateId: string | null;
                                    name: string;
                                    description: string | null;
                                    /** @enum {string} */
                                    type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                    /** @enum {string|null} */
                                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                    defaultValue: {
                                        address: {
                                            streetAddress: string | null;
                                            city: string | null;
                                            state: string | null;
                                            zip: string | null;
                                            country: string | null;
                                        } | null;
                                        boolean: boolean | null;
                                        contact: {
                                            name: string | null;
                                            title: string | null;
                                            email: string | null;
                                            phone: string | null;
                                        } | null;
                                        /** Format: date-time */
                                        date: string | null;
                                        number: number | null;
                                        option: {
                                            id: string;
                                            name: string;
                                            templateId: string | null;
                                        } | null;
                                        options: {
                                            id: string;
                                            name: string;
                                            templateId: string | null;
                                        }[];
                                        string: string | null;
                                        user: {
                                            id: string;
                                            accountId: string;
                                            firstName: string | null;
                                            lastName: string | null;
                                            fullName: string | null;
                                            email: string;
                                            profilePicPath: string | null;
                                            /** Format: date-time */
                                            tsAndCsSignedAt: string | null;
                                            isAdmin: boolean;
                                            isApprover: boolean;
                                            isGlobalAdmin: boolean;
                                        } | null;
                                        file: {
                                            id: string;
                                            accountId: string;
                                            blobId: string;
                                            name: string;
                                            contentType: string;
                                            downloadPath: string;
                                            previewPath: string;
                                        } | null;
                                        files: {
                                            id: string;
                                            accountId: string;
                                            blobId: string;
                                            name: string;
                                            contentType: string;
                                            downloadPath: string;
                                            previewPath: string;
                                        }[];
                                        resource: {
                                            id: string;
                                            /** @enum {string} */
                                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                            templateId: string | null;
                                            name: string;
                                            key: number;
                                        } | null;
                                        /** Format: date-time */
                                        updatedAt: string;
                                    } | null;
                                    defaultToToday: boolean;
                                    isRequired: boolean;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                }[];
                            }[];
                            fields: {
                                fieldId: string;
                                templateId: string | null;
                                name: string;
                                description: string | null;
                                /** @enum {string} */
                                type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                /** @enum {string|null} */
                                resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                defaultValue: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                } | null;
                                defaultToToday: boolean;
                                isRequired: boolean;
                                options: {
                                    id: string;
                                    name: string;
                                    templateId: string | null;
                                }[];
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/schemas/custom/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            sections: {
                                id: string;
                                name: string;
                                fields: {
                                    fieldId: string;
                                    templateId: string | null;
                                    name: string;
                                    description: string | null;
                                    /** @enum {string} */
                                    type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                    /** @enum {string|null} */
                                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                    defaultValue: {
                                        address: {
                                            streetAddress: string | null;
                                            city: string | null;
                                            state: string | null;
                                            zip: string | null;
                                            country: string | null;
                                        } | null;
                                        boolean: boolean | null;
                                        contact: {
                                            name: string | null;
                                            title: string | null;
                                            email: string | null;
                                            phone: string | null;
                                        } | null;
                                        /** Format: date-time */
                                        date: string | null;
                                        number: number | null;
                                        option: {
                                            id: string;
                                            name: string;
                                            templateId: string | null;
                                        } | null;
                                        options: {
                                            id: string;
                                            name: string;
                                            templateId: string | null;
                                        }[];
                                        string: string | null;
                                        user: {
                                            id: string;
                                            accountId: string;
                                            firstName: string | null;
                                            lastName: string | null;
                                            fullName: string | null;
                                            email: string;
                                            profilePicPath: string | null;
                                            /** Format: date-time */
                                            tsAndCsSignedAt: string | null;
                                            isAdmin: boolean;
                                            isApprover: boolean;
                                            isGlobalAdmin: boolean;
                                        } | null;
                                        file: {
                                            id: string;
                                            accountId: string;
                                            blobId: string;
                                            name: string;
                                            contentType: string;
                                            downloadPath: string;
                                            previewPath: string;
                                        } | null;
                                        files: {
                                            id: string;
                                            accountId: string;
                                            blobId: string;
                                            name: string;
                                            contentType: string;
                                            downloadPath: string;
                                            previewPath: string;
                                        }[];
                                        resource: {
                                            id: string;
                                            /** @enum {string} */
                                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                            templateId: string | null;
                                            name: string;
                                            key: number;
                                        } | null;
                                        /** Format: date-time */
                                        updatedAt: string;
                                    } | null;
                                    defaultToToday: boolean;
                                    isRequired: boolean;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                }[];
                            }[];
                            fields: {
                                fieldId: string;
                                templateId: string | null;
                                name: string;
                                description: string | null;
                                /** @enum {string} */
                                type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                /** @enum {string|null} */
                                resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                defaultValue: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                } | null;
                                defaultToToday: boolean;
                                isRequired: boolean;
                                options: {
                                    id: string;
                                    name: string;
                                    templateId: string | null;
                                }[];
                            }[];
                        }[];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/schemas/{resourceType}/custom/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                            sections: {
                                id: string;
                                name: string;
                                fields: {
                                    fieldId: string;
                                    templateId: string | null;
                                    name: string;
                                    description: string | null;
                                    /** @enum {string} */
                                    type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                    /** @enum {string|null} */
                                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                    defaultValue: {
                                        address: {
                                            streetAddress: string | null;
                                            city: string | null;
                                            state: string | null;
                                            zip: string | null;
                                            country: string | null;
                                        } | null;
                                        boolean: boolean | null;
                                        contact: {
                                            name: string | null;
                                            title: string | null;
                                            email: string | null;
                                            phone: string | null;
                                        } | null;
                                        /** Format: date-time */
                                        date: string | null;
                                        number: number | null;
                                        option: {
                                            id: string;
                                            name: string;
                                            templateId: string | null;
                                        } | null;
                                        options: {
                                            id: string;
                                            name: string;
                                            templateId: string | null;
                                        }[];
                                        string: string | null;
                                        user: {
                                            id: string;
                                            accountId: string;
                                            firstName: string | null;
                                            lastName: string | null;
                                            fullName: string | null;
                                            email: string;
                                            profilePicPath: string | null;
                                            /** Format: date-time */
                                            tsAndCsSignedAt: string | null;
                                            isAdmin: boolean;
                                            isApprover: boolean;
                                            isGlobalAdmin: boolean;
                                        } | null;
                                        file: {
                                            id: string;
                                            accountId: string;
                                            blobId: string;
                                            name: string;
                                            contentType: string;
                                            downloadPath: string;
                                            previewPath: string;
                                        } | null;
                                        files: {
                                            id: string;
                                            accountId: string;
                                            blobId: string;
                                            name: string;
                                            contentType: string;
                                            downloadPath: string;
                                            previewPath: string;
                                        }[];
                                        resource: {
                                            id: string;
                                            /** @enum {string} */
                                            type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                            templateId: string | null;
                                            name: string;
                                            key: number;
                                        } | null;
                                        /** Format: date-time */
                                        updatedAt: string;
                                    } | null;
                                    defaultToToday: boolean;
                                    isRequired: boolean;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                }[];
                            }[];
                            fields: {
                                fieldId: string;
                                templateId: string | null;
                                name: string;
                                description: string | null;
                                /** @enum {string} */
                                type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                /** @enum {string|null} */
                                resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                defaultValue: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                } | null;
                                defaultToToday: boolean;
                                isRequired: boolean;
                                options: {
                                    id: string;
                                    name: string;
                                    templateId: string | null;
                                }[];
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string[];
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/accounts/{accountId}/schemas/{resourceType}/custom/sections/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            name: string;
                            fields: {
                                fieldId: string;
                                templateId: string | null;
                                name: string;
                                description: string | null;
                                /** @enum {string} */
                                type: "Address" | "Checkbox" | "Contact" | "Date" | "File" | "Files" | "Money" | "MultiSelect" | "Number" | "Select" | "Text" | "Textarea" | "User" | "Resource";
                                /** @enum {string|null} */
                                resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor" | null;
                                defaultValue: {
                                    address: {
                                        streetAddress: string | null;
                                        city: string | null;
                                        state: string | null;
                                        zip: string | null;
                                        country: string | null;
                                    } | null;
                                    boolean: boolean | null;
                                    contact: {
                                        name: string | null;
                                        title: string | null;
                                        email: string | null;
                                        phone: string | null;
                                    } | null;
                                    /** Format: date-time */
                                    date: string | null;
                                    number: number | null;
                                    option: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    } | null;
                                    options: {
                                        id: string;
                                        name: string;
                                        templateId: string | null;
                                    }[];
                                    string: string | null;
                                    user: {
                                        id: string;
                                        accountId: string;
                                        firstName: string | null;
                                        lastName: string | null;
                                        fullName: string | null;
                                        email: string;
                                        profilePicPath: string | null;
                                        /** Format: date-time */
                                        tsAndCsSignedAt: string | null;
                                        isAdmin: boolean;
                                        isApprover: boolean;
                                        isGlobalAdmin: boolean;
                                    } | null;
                                    file: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    } | null;
                                    files: {
                                        id: string;
                                        accountId: string;
                                        blobId: string;
                                        name: string;
                                        contentType: string;
                                        downloadPath: string;
                                        previewPath: string;
                                    }[];
                                    resource: {
                                        id: string;
                                        /** @enum {string} */
                                        type: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                                        templateId: string | null;
                                        name: string;
                                        key: number;
                                    } | null;
                                    /** Format: date-time */
                                    updatedAt: string;
                                } | null;
                                defaultToToday: boolean;
                                isRequired: boolean;
                                options: {
                                    id: string;
                                    name: string;
                                    templateId: string | null;
                                }[];
                            }[];
                        }[];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/schemas/{resourceType}/custom/sections/{sectionId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                    sectionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    resourceType: "Bill" | "Customer" | "Item" | "Line" | "Purchase" | "Vendor";
                    sectionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name?: string;
                        fieldIds: string[];
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/accounts/{accountId}/users/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            firstName: string | null;
                            lastName: string | null;
                            fullName: string | null;
                            email: string;
                            profilePicPath: string | null;
                            /** Format: date-time */
                            tsAndCsSignedAt: string | null;
                            isAdmin: boolean;
                            isApprover: boolean;
                            isGlobalAdmin: boolean;
                        }[];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: email */
                        email: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/accounts/{accountId}/users/{userId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            firstName: string | null;
                            lastName: string | null;
                            fullName: string | null;
                            email: string;
                            profilePicPath: string | null;
                            /** Format: date-time */
                            tsAndCsSignedAt: string | null;
                            isAdmin: boolean;
                            isApprover: boolean;
                            isGlobalAdmin: boolean;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** Format: email */
                        email?: string;
                        firstName?: string;
                        lastName?: string;
                        /** Format: uuid */
                        imageBlobId?: string;
                        /** Format: date-time */
                        tsAndCsSignedAt?: string;
                        isAdmin?: boolean;
                        isApprover?: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/integrations/quickbooks/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": Record<string, never>;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/quickbooks/disconnect/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query: {
                    realmId: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/quickbooks/connect/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query: {
                    url: string;
                };
                header?: never;
                path: {
                    accountId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/mcmaster/process-poom/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string;
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/self/{userId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            firstName: string | null;
                            lastName: string | null;
                            fullName: string | null;
                            email: string;
                            profilePicPath: string | null;
                            /** Format: date-time */
                            tsAndCsSignedAt: string | null;
                            isAdmin: boolean;
                            isApprover: boolean;
                            isGlobalAdmin: boolean;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sessions/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: email */
                        email: string;
                        tat: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Session"];
                    };
                };
            };
        };
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    sessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sessions/{sessionId}/extend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    sessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Session"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sessions/{sessionId}/impersonate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    sessionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: uuid */
                        accountId: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sessions/{sessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    sessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Session"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sessions/request-token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: email */
                        email: string;
                        returnTo?: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/self/{userId}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            accountId: string;
                            firstName: string | null;
                            lastName: string | null;
                            fullName: string | null;
                            email: string;
                            profilePicPath: string | null;
                            /** Format: date-time */
                            tsAndCsSignedAt: string | null;
                            isAdmin: boolean;
                            isApprover: boolean;
                            isGlobalAdmin: boolean;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/webhooks/bills-inbox": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": unknown;
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/webhooks/post-deployment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Account: {
            id: string;
            key: string;
            name: string;
            address: string;
            logoPath: string | null;
            logoBlobId: string | null;
        };
        Session: {
            id: string;
            accountId: string;
            userId: string;
            /** Format: date-time */
            expiresAt: string;
        };
        JsonLogic: {
            "==": [
                {
                    var: string;
                },
                unknown
            ];
        } | {
            "!=": [
                {
                    var: string;
                },
                unknown
            ];
        } | {
            and: unknown[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
