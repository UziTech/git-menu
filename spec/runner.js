/** @babel */

import {createRunner} from "atom-jasmine3-test-runner";

export default createRunner({
	specHelper: {
		jasmineFocused: true,
		jasminePass: true,
		attachToDom: true,
		ci: true
	},
});
