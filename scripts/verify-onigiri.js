#!/usr/bin/env node

/**
 * verify-onigirijs.js
 * ---------------------------------------------------------------------------
 * Verifies OnigiriJS Framework repository standards.
 *
 * OnigiriJS is a modular and granular JavaScript framework.
 *
 * Structure:
 *
 * src/framework/
 *
 * ├── core/
 * │   └── onigiri-core.js
 * │
 * ├── translation/
 * │   └── onigiri-translation.js
 * │
 * ├── ajax/
 * │   └── onigiri-ajax.js
 * │
 * └── ...
 *
 *
 * Validation:
 *
 *  1. Core framework integrity
 *  2. Core public API stability
 *  3. Framework module structure
 *  4. Module naming conventions
 *  5. Module integration
 *  6. Security checks
 *  7. Documentation presence
 *
 *
 * Usage:
 *
 *   node scripts/verify-onigirijs.js
 *
 *   node scripts/verify-onigirijs.js --strict
 *
 * ---------------------------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const ROOT = process.cwd();

const FRAMEWORK_DIR = path.join(
    ROOT,
    'src',
    'framework'
);

const CORE_FILE = path.join(
    FRAMEWORK_DIR,
    'core',
    'onigiri-core.js'
);

const STRICT =
    process.argv.includes('--strict');

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------
const errors = [];
const warnings = [];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function log(message)
{
    console.log(message);
}

function exists(file)
{
    return fs.existsSync(file);
}

function read(file)
{
    return fs.readFileSync(file, 'utf8');
}

function error(message)
{
    errors.push(message);
}

function warning(message)
{
    warnings.push(message);
}

// -----------------------------------------------------------------------------
// Core Verification
// -----------------------------------------------------------------------------
function verifyCore()
{

    log('Checking OnigiriJS core...');

    if (!exists(CORE_FILE))
    {

        error(
            'Missing src/framework/core/onigiri-core.js'
        );

        return;

    }

    const source = read(CORE_FILE);

    const requiredExports = [
        'Onigiri.version',
        'Onigiri.use',
        'global.Onigiri',
        'global.O'

    ];

    for (const item of requiredExports)
    {

        if (!source.includes(item))
        {

            error(
                `Core missing required export: ${item}`
            );

        }

    }

    const requiredMethods = [

        'each',
        'on',
        'off',
        'trigger',

        'addClass',
        'removeClass',
        'toggleClass',

        'attr',
        'removeAttr',

        'data',

        'html',
        'text',
        'val',

        'css',

        'show',
        'hide',

        'append',
        'prepend',

        'remove',
        'empty',

        'find',
        'parent',
        'children',
        'siblings'

    ];

    for (const method of requiredMethods)
    {

        const signature =
            `Onigiri.prototype.${method}`;

        if (!source.includes(signature))
        {

            error(
                `Core missing method: ${method}()`
            );

        }

    }

    const version =
        source.match(
            /Onigiri\.version\s*=\s*['"]([^'"]+)/
        );

    if (version)
    {

        log(
            `Detected core version: ${version[1]}`
        );

    }
    else
    {

        error(
            'Unable to detect Onigiri.version'
        );

    }

    if (source.includes('eval('))
    {

        error(
            'Core contains forbidden eval()'
        );

    }

    if (source.includes('debugger'))
    {

        error(
            'Core contains debugger statement'
        );

    }

}

// -----------------------------------------------------------------------------
// Module Verification
// -----------------------------------------------------------------------------
function verifyModules()
{

    log('Checking framework modules...');

    if (!exists(FRAMEWORK_DIR))
    {

        error(
            'Missing src/framework directory'
        );

        return;

    }

    const folders =
        fs.readdirSync(FRAMEWORK_DIR);

    for (const folder of folders)
    {

        if (folder === 'core')
        {
            continue;
        }

        const moduleDir =
            path.join(
                FRAMEWORK_DIR,
                folder
            );

        if (
            !fs.statSync(moduleDir).isDirectory()
        )
        {
            continue;
        }

        const expectedFile =
            `onigiri-${folder}.js`;

        const moduleFile =
            path.join(
                moduleDir,
                expectedFile
            );

        if (!exists(moduleFile))
        {

            error(
                `${folder}: missing ${expectedFile}`
            );

            continue;

        }

        const source =
            read(moduleFile);

        //
        // Verify module integration
        //
        const integrations = [
            'Onigiri.',
            'Onigiri.prototype.',
            'global.Onigiri',
            'window.Onigiri'

        ];

        const integrates =
            integrations.some(
                item => source.includes(item)
            );

        if (!integrates)
        {

            error(
                `${folder}: does not appear to integrate with OnigiriJS core`
            );

        }

        //
        // Optional metadata
        //
        if (
            !source.includes('OnigiriJS Module')
        )
        {

            warning(
                `${folder}: missing optional module metadata header`
            );

        }

        //
        // Security checks
        //
        if (source.includes('eval('))
        {

            error(
                `${folder}: contains forbidden eval()`
            );

        }

        if (source.includes('debugger'))
        {

            error(
                `${folder}: contains debugger statement`
            );

        }

        if (
            source.includes('console.log')
        )
        {

            warning(
                `${folder}: contains console.log`
            );

        }

    }

}

// -----------------------------------------------------------------------------
// Documentation Verification
// -----------------------------------------------------------------------------
function verifyDocumentation()
{

    log('Checking documentation...');

    const requiredFiles = [

        'README.md',
        'LICENSE'

    ];

    for (const file of requiredFiles)
    {

        if (
            !exists(
                path.join(ROOT, file)
            )
        )
        {

            error(
                `Missing required file: ${file}`
            );

        }

    }

}

// -----------------------------------------------------------------------------
// Output
// -----------------------------------------------------------------------------
function report()
{

    log('');

    log(
        'OnigiriJS Framework Verification'
    );

    log(
        '================================'
    );

    log('');

    if (errors.length)
    {

        log(
            `✗ Errors: ${errors.length}`
        );

        for (const item of errors)
        {

            log(
                `  ✗ ${item}`
            );

        }

        log('');

    }

    if (warnings.length)
    {

        log(
            `⚠ Warnings: ${warnings.length}`
        );

        for (const item of warnings)
        {

            log(
                `  ⚠ ${item}`
            );

        }

        log('');

    }

    const failed =
        errors.length > 0 ||
        (
            STRICT &&
            warnings.length > 0
        );

    if (failed)
    {

        console.error(
            'verify-onigirijs: FAILED'
        );

    }
    else
    {

        console.log(
            'verify-onigirijs: PASSED'
        );

    }

    process.exitCode =
        failed ? 1 : 0;

}

// -----------------------------------------------------------------------------
// Execute
// -----------------------------------------------------------------------------

verifyCore();

verifyModules();

verifyDocumentation();

report();
