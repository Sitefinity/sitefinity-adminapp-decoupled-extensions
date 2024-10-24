# Sitefinity AdminApp Decoupled Extension

## Overview
This repository provides a foundational setup to help you quickly begin developing agnostic extensions for Sitefinity. It adheres to all necessary requirements and conventions, ensuring compatibility and efficiency. Please review this documentation carefully to familiarize yourself with the essential principles, allowing you to choose the development process and technology stack that best suits your needs.

### Rich Text Editor Extensions

#### Registering Your Custom Tool

To register a new tool in the Rich Text Editor, the following steps **must** be strictly followed:

1. Navigate to **Sitefinity > Administration > Settings > Backend Interface > Rich Text Editor**.
2. Within the Default toolset, or any custom toolset you have configured, add your custom tool to the `tools` array as shown below:

    ```json
    {
        "name": "myCustomTool",
        "functionName": "myCustomToolExec",
        "tooltip": "My custom tool does some work"
    }
    ```

    **Important:** Even though the UI does not prompt for the `functionName` property, it is **mandatory** for custom tools. If this property is omitted or misspelled, the tool **will** malfunction.

#### Registering the Exec Function for Your Custom Tool

In this repository, you **must** ensure that the build process produces at least two essential files under a folder named `dist` after running `npm run build`:

1. **manifest.json**: This file **must** be valid JSON and **must** contain an entry point file (key) named `index`. For example:

    ```json
    {
        "index": "index.abcdefg12345678.js"
    }
    ```

    The `manifest.json` is crucial because the `index.js` file **must** include a hash in its name to facilitate effective caching and cache busting.

2. **index.js**: This file can contain any JavaScript code, provided the following conditions are met:

    - The function specified in the `functionName` property **must** be attached to the `window` object.
    - The function specified in the `functionName` property **must** have a return type of `void` and accept only one parameter of type `Event`.

    Example:

    ```js
    let globalObject = typeof window !== 'undefined' ? window : global;

    function myCustomToolExec(e) {
        e.preventDefault();
        console.log("Hi mom!");
    }

    globalObject.myCustomToolExec = myCustomToolExec;
    ```

    Alternatively, you can use TypeScript with or without a bundler. For example:

    ```ts
    let globalObject: any = typeof window !== 'undefined' ? window : global;

    function myCustomToolExec(e: Event): void {
        e.preventDefault();
        console.log("Hi mom!");
    }

    globalObject.myCustomToolExec = myCustomToolExec;
    ```

    If you run this through a bundler, such as esbuild, the output file should resemble the following:

    ```js
    var t=typeof window<"u"?window:global;function e(o){o.preventDefault(),console.log("Hi mom!")}t.myCustomToolExec=e;
    ```
