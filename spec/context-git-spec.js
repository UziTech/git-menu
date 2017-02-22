"use babel";
/* globals describe, beforeEach, atom, it, expect, waitsForPromise, runs, spyOn, jasmine */

import commands from "../lib/commands";

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("Context Git", _ => {
	beforeEach(_ => {
		waitsForPromise(_ => atom.packages.activatePackage("context-git"));
	});

	it("should have tests", _ => {
		expect(true).toBe(true);
	});
	// describe("Commands", _ => {
	//
	// });
});
