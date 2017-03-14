"use babel";

import { createRunner } from "atom-jasmine2-test-runner";

export default createRunner({
	specHelper: {
		jasmineFocused: true,
		jasminePass: true,
		ci: true
	},
}, function () {
	// this is needed for jasmine-promises https://github.com/matthewjh/jasmine-promises/issues/8
	global.jasmineRequire = {};
	require("jasmine-promises");
});
