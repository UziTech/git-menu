/** @babel */

/** @jsx etch.dom */

import etch from "etch";
import Autocomplete from "../../lib/widgets/Autocomplete.js";

describe("Autocomplete.js", function () {
	beforeEach(function () {
		etch.setScheduler({
			updateDocument(callback) {
				callback();
			},
			getNextUpdatePromise() {
				return Promise.resolve();
			}
		});

		this.items = [
			"item1",
			"item2",
			"item3",
			"item4",
			"item5",
			"item6",
			"item7",
			"item8",
			"item9",
			"item10",
			"item11",
			"item12",
			"item13",
		];
	});

	it("should not display the menu on focus if value is empty", function () {
		const component = new Autocomplete({items: this.items, value: ""});
		jasmine.attachToDOM(component.element);
		component.refs.input.focus();

		expect(component.isOpen()).toBe(false);
		expect(component.refs.menu).toBeFalsy();
	});

	it("should display the menu on focus", function () {
		const component = new Autocomplete({items: this.items, value: "i"});
		jasmine.attachToDOM(component.element);
		component.refs.input.focus();

		expect(component.isOpen()).toBe(true);
		expect(component.refs.menu).toBeTruthy();
		for (var i = 0; i < this.items.length; i++) {
			expect(component.refs[`item-${i}`]).toBeTruthy();
		}
	});

	it("should only display max number of items", function () {
		const maxItems = 10;
		const component = new Autocomplete({items: this.items, value: "i", maxItems});
		jasmine.attachToDOM(component.element);
		component.refs.input.focus();

		for (var i = 0; i < this.items.length; i++) {
			if (i < maxItems) {
				expect(component.refs[`item-${i}`]).toBeTruthy();
			} else {
				expect(component.refs[`item-${i}`]).toBeFalsy();
			}
		}
	});

	it("should filter items", function () {
		const value = "1";
		const component = new Autocomplete({items: this.items, value});
		jasmine.attachToDOM(component.element);
		component.refs.input.focus();

		const filtered = Array.from(component.refs.menu.children).every(item => item.textContent.includes(value));
		expect(filtered).toBe(true);
	});

	it("should hide item when value equals item", function () {
		const value = "item1";
		const component = new Autocomplete({items: this.items, value});
		jasmine.attachToDOM(component.element);
		component.refs.input.focus();

		const hasItem = Array.from(component.refs.menu.children).some(item => item === value);
		expect(hasItem).toBe(false);
	});

	it("should call onSelect when an item is clicked", function () {
		const onSelect = jasmine.createSpy("onSelect");
		const component = new Autocomplete({items: this.items, onSelect, open: true});
		jasmine.attachToDOM(component.element);
		component.refs["item-0"].click();

		expect(onSelect).toHaveBeenCalled();
	});

	it("should not call onSelect when remove button is clicked", function () {
		const onSelect = jasmine.createSpy("onSelect");
		const onRemove = jasmine.createSpy("onRemove");
		const component = new Autocomplete({
			items: this.items,
			onSelect,
			onRemove,
			removeButton: true,
			open: true,
		});
		jasmine.attachToDOM(component.element);
		component.refs["item-0"].querySelector(".autocomplete-remove-button").click();

		expect(onSelect).not.toHaveBeenCalled();
		expect(onRemove).toHaveBeenCalled();
	});
});
