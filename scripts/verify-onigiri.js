#!/usr/bin/env node

/**
 * verify-onigiri.js
 * ---------------------------------------------------------------------------
 * Verifies OnigiriJS Framework repository standards.
 *
 * Designed for GitHub Actions pull request validation.
 *
 * Repository structure:
 *
 * framework/
 * ├── core/
 * │   └── onigiri-core.js
 * │
 * ├── module-name/
 * │   └── onigiri-module-name.js
 *
 *
 * Checks:
 *
 *  1. Core framework integrity
 *  2. Public API availability
 *  3. Module naming conventions
 *  4. Module registration
 *  5. Module metadata
 *  6. Security checks
 *  7. Documentation files
 *
 *
 * Usage:
 *
 *   node scripts/verify-onigiri.js
 *
 *   node scripts/verify-onigiri.js --strict
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

const FRAMEWORK_DIR =
    path.join(
        ROOT,
        'src',
        'framework'
    );

const CORE_FILE =
    path.join(
        FRAMEWORK_DIR,
        'core',
        'onigiri-core.js'
    );

const STRICT =
    process.argv.includes('--strict');

// -----------------------------------------------------------------------------
// Result storage
// -----------------------------------------------------------------------------
const errors = [];
const warnings = [];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function log(message) {
    process.stdout.write(message + '\n');
}

function exists(file) {
    return fs.existsSync(file);
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

function addError(message) {
    errors.push(message);
}

function addWarning(message) {
    warnings.push(message);
}

// -----------------------------------------------------------------------------
// Core Validation
// -----------------------------------------------------------------------------
function verifyCore() {

    log(
        'Checking OnigiriJS core...'
    );

    if (!exists(CORE_FILE)) {

        addError(
            'Missing framework/core/onigiri-core.js'
        );

        return;

    }

    const source =
        read(CORE_FILE);

    const requiredExports = [
        'Onigiri.version',
        'Onigiri.use',
        'global.Onigiri',
        'global.O'

    ];

    for (const item of requiredExports) {

        if (!source.includes(item)) {

            addError(
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

    for (const method of requiredMethods) {

        const signature =
            `Onigiri.prototype.${method}`;

        if (!source.includes(signature)) {

            addError(
                `Core missing method: ${method}()`
            );

        }

    }

    const version =
        source.match(
            /Onigiri\.version\s*=\s*['"]([^'"]+)/
        );

    if (!version) {

        addError(
            'Unable to detect Onigiri.version'
        );

    } else {

        log(
            `Detected core version: ${version[1]}`
        );

    }

    if (
        source.includes('eval(')
    ) {

        addError(
            'Core contains forbidden eval()'
        );

    }

    if (
        source.includes('debugger')
    ) {

        addError(
            'Core contains debugger statement'
        );

    }

}

// -----------------------------------------------------------------------------
// Module Validation
// -----------------------------------------------------------------------------
function verifyModules() {

    log(
        'Checking framework modules...'
    );

    if (!exists(FRAMEWORK_DIR)) {

        addError(
            'Missing framework directory'
        );

        return;

    }

    const folders =
        fs.readdirSync(FRAMEWORK_DIR);

    for (const folder of folders) {

        if (folder === 'core') {
            continue;
        }

        const moduleDir =
            path.join(
                FRAMEWORK_DIR,
                folder
            );

        if (
            !fs.statSync(moduleDir).isDirectory()
        ) {
            continue;
        }

        const expectedFile =
            `onigiri-${folder}.js`;


        const moduleFile =
            path.join(
                moduleDir,
                expectedFile
            );

        if (!exists(moduleFile)) {

            addError(
                `${folder}: missing ${expectedFile}`
            );

            continue;

        }

        const source =
            read(moduleFile);

        if (
            !source.includes('Onigiri.use')
        ) {

            addError(
                `${folder}: missing Onigiri.use() registration`
            );

        }

        if (
            !source.includes('OnigiriJS Module')
        ) {

            addWarning(
                `${folder}: missing module metadata header`
            );

        }

        if (
            source.includes('eval(')
        ) {

            addError(
                `${folder}: uses forbidden eval()`
            );

        }

        if (
            source.includes('debugger')
        ) {

            addError(
                `${folder}: contains debugger statement`
            );

        }

        if (
            source.includes('console.log')
        ) {

            addWarning(
                `${folder}: contains console.log`
            );

        }

    }

}

function verifyDocumentation() {

    log(
        'Checking documentation...'
    );


    const requiredFiles = [

        'README.md',
        'LICENSE'

    ];

    for (const file of requiredFiles) {

        if (!exists(path.join(ROOT, file))) {

            addError(
                `Missing required file: ${file}`
            );

        }

    }

}

function report() {

    log('');

    log(
        'OnigiriJS Framework Verification'
    );

    log(
        '================================'
    );

    log('');

    if (errors.length) {

        log(
            `✗ Errors: ${errors.length}`
        );


        for (const error of errors) {

            log(
                `  ✗ ${error}`
            );

        }

        log('');

    }

    if (warnings.length) {

        log(
            `⚠ Warnings: ${warnings.length}`
        );

        for (const warning of warnings) {

            log(
                `  ⚠ ${warning}`
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

    if (failed) {

        console.error(
            'verify-onigiri: FAILED'
        );

    } else {

        console.log(
            'verify-onigiri: PASSED'
        );

    }

    process.exitCode =
        failed ? 1 : 0;

}

verifyCore();

verifyModules();

verifyDocumentation();

report();
