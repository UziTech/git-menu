/** @babel */

import {createRunner} from "atom-jasmine2-test-runner";

export default createRunner({
	specHelper: {
		jasmineFocused: true,
		jasminePass: true,
		attachToDom: true,
		ci: true
	},
});
