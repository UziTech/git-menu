"use babel";

/*

Copyright (c) 2015 Ryan Florence
for https://github.com/reactjs/react-autocomplete

Copyright © 2015 Nicolas Bevacqua
for https://github.com/bevacqua/fuzzysearch

 */

// modified from https://github.com/reactjs/react-autocomplete

/** @jsx etch.dom */

import etch from "etch";

const IMPERATIVE_API = [
	"blur",
	"checkValidity",
	"click",
	"focus",
	"select",
	"setCustomValidity",
	"setSelectionRange",
	"setRangeText",
];
export default class Autocomplete {

	constructor(props) {

		this.props = { ...this.getDefaultProps(), ...props };
		this.state = this.getInitialState();

		this.componentWillMount();

		this.handleInputFocus = this.handleInputFocus.bind(this);
		this.handleInputBlur = this.handleInputBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleInputClick = this.handleInputClick.bind(this);

		etch.initialize(this);

		this.componentDidMount();
		this.exposeAPI(this.refs.input);
	}

	update(props) {
		const prevProps = this.props;

		this.componentWillReceiveProps(props);

		this.props = { ...this.getDefaultProps(), ...props };

		etch.update(this);

		this.componentDidUpdate(prevProps, this.state);
	}

	destroy() {
		etch.destroy(this);
	}

	setState(state) {
		const prevState = this.state;

		this.state = { ...this.state, ...state };

		etch.update(this);

		this.componentDidUpdate(this.props, prevState);
	}

	getDefaultProps() {
		return {

			/** @type {String[]} The items to display in the dropdown menu */
			items: [],

			/** @type {Number} The maximum number of items to render. 0 = all */
			maxItems: 0,

			/** @type {String} The value to display in the input field */
			value: "",

			/**
			 * Props that are applied to the element which wraps the `<input />` and
				* dropdown menu elements rendered by `Autocomplete`.
			 * @type {Object}
			 */
			wrapperProps: {},

			/**
			 * Props that are applied to the `<input />` element rendered by
			 * `Autocomplete`. Any properties supported by `HTMLInputElement` can be
			 * specified, apart from the following which are set by `Autocomplete`:
			 * value, autoComplete, role, aria-autocomplete
			 * @type {Object}
			 */
			inputProps: {},

			/**
			 * Invoked every time the user changes the input's value.
			 * @param  {Event} event The dispatched event
			 * @param  {String} value The new value of the input
			 * @return {void}
			 */
			onChange(event, value) {},

			/**
			 * Invoked every time the user changes the input's value.
			 * @param  {Event} event The dispatched event
			 * @param  {String} value The new value of the input
			 * @return {void}
			 */
			onInput(event, value) {},

			/**
			 * Invoked when the user selects an item from the dropdown menu.
			 * @param  {String} value The value of the item
			 * @param  {String} item The item selected
			 * @return {void}
			 */
			onSelect(value, item) {},

			/**
			 * Invoked to generate the render tree for the dropdown menu. Ensure the
			 * returned tree includes `items` or else no items will be rendered.
			 * `styles` will contain { top, left, minWidth } which are the coordinates
			 * of the top-left corner and the width of the dropdown menu.
			 * @param  {Component[]} items The items to render
			 * @param  {String} value The current value of the input
			 * @param  {Object} styles Menu styles
			 * @return {Component} The rendered menu
			 */
			renderMenu(items, value, styles) {
				return (
					<div className="autocomplete-menu" style={{ ...styles, ...this.menuStyle }}>
						{items}
					</div>
				);
			},

			/**
			 * Styles that are applied to the dropdown menu in the default `renderMenu`
			 * implementation. If you override `renderMenu` and you want to use
			 * `menuStyles` you must manually apply them (`this.props.menuStyles`).
			 * <... style={{ ...styles, ...this.props.menuStyle }} ...>
			 * @type {Object}
			 */
			menuStyle: {
				position: "fixed",
				zIndex: "1",
			},

			/**
			 * Invoked for each entry in `items` that also passes `shouldItemRender` to
			 * generate the render tree for each item in the dropdown menu. `styles` is
			 * an optional set of styles that can be applied to improve the look/feel
			 * of the items in the dropdown menu.
			 * @param  {String} value The item value
			 * @param  {Boolean} isHighlighted Is item highlighted?
			 * @param  {Object} styles Item styles
			 * @return {Component} The renderd item
			 */
			renderItem(value, isHighlighted, styles) {
				return (
					<div className={"autocomplete-item" + (isHighlighted ? " autocomplete-highlight" : "")} style={styles}>{value}</div>
				);
			},

			/**
			 * Used to read the display value from each entry in `items`.
			 * @param  {String} item The item
			 * @return {String} The value of the item
			 */
			getItemValue(item) {
				return item;
			},

			/**
			 * A distance function to determine item weight.
			 * @param  {String} item The value of the item
			 * @param  {String} value The value of the input
			 * @return {Any} The weight of this item with the given value
			 */
			getItemWeight(item, value) {
				// modified from https://github.com/bevacqua/fuzzysearch
				const hlen = item.length;
				const nlen = value.length;
				if (nlen > hlen) {
					return false;
				}
				if (nlen === hlen) {
					return value === item;
				}
				let weight = 0;
				outer: for (let i = 0, j = 0; i < nlen; i++) {
					const nch = value.charCodeAt(i);
					while (j < hlen) {
						if (item.charCodeAt(j++) === nch) {
							weight += (j - 1);
							continue outer;
						}
					}
					return false;
				}
				return weight;
			},

			/**
			 * Invoked for each entry in `items` and its return value is used to
			 * determine whether or not it should be displayed in the dropdown menu.
			 * By default all items are always rendered.
			 * @param  {String} item The value of the item
			 * @param  {String} value The value of the input
			 * @param  {Any} weight The weight returned by this.props.getItemWeight
			 * @return {Boolean} Should the item be rendered?
			 */
			shouldItemRender(item, value, weight) {
				return item !== value && (value === "" || weight !== false);
			},

			/**
			 * The function which is used to sort `items` before display.
			 * @param  {String} itemA The first item value to compare
			 * @param  {String} itemB The second item value to compare
			 * @param  {String} value The value of the input
			 * @param  {Any} weightA The weight returned by this.props.getItemWeight of the first item
			 * @param  {Any} weightB The weight returned by this.props.getItemWeight of the second item
			 * @return {integer} < 0: itemA first; > 0 itemB first; = 0 leave unchanged
			 */
			sortItems(itemA, itemB, value, weightA, weightB) {
				if (weightA === weightB) {
					return 0;
				}

				return (weightA < weightB ? -1 : 1);
			},

			/** @type {Boolean} Whether or not to automatically highlight the top match in the dropdown menu. */
			autoHighlight: false,

			/**
			 * Invoked every time the dropdown menu's visibility changes (i.e. every
			 * time it is displayed/hidden).
			 * @param  {Boolean} isOpen Is the menu showing?
			 * @return {void}
			 */
			onMenuVisibilityChange(isOpen) {},

			/**
			 * Used to override the internal logic which displays/hides the dropdown
			 * menu. This is useful if you want to force a certain state based on your
			 * UX/business logic. Use it together with `onMenuVisibilityChange` for
			 * fine-grained control over the dropdown menu dynamics.
			 * @type {Boolean}
			 */
			// open: true,

			/**
			 * tabindex of input
			 * @type {Number|String}
			 */
			tabIndex: "",
		};
	}

	getInitialState() {
		return {
			isOpen: false,
			highlightedIndex: null,
			menuPositionSet: false,
		};
	}

	componentWillMount() {
		// this.refs is frozen, so we need to assign a new object to it
		this.refs = {};
		this._ignoreBlur = false;
		this._performAutoCompleteOnUpdate = false;
		this._performAutoCompleteOnKeyUp = false;
	}

	componentWillReceiveProps(nextProps) {
		this._performAutoCompleteOnUpdate = true;
		// If `items` has changed we want to reset `highlightedIndex`
		// since it probably no longer refers to a relevant item
		if (this.props.items !== nextProps.items ||
		// The entries in `items` may have been changed even though the
		// object reference remains the same, double check by seeing
		// if `highlightedIndex` points to an existing item
		this.state.highlightedIndex >= nextProps.items.length) {
			this.setState({highlightedIndex: null});
		}
	}

	componentDidMount() {
		if (this.isOpen()) {
			this.setMenuPositions();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if ((this.state.isOpen && !prevState.isOpen) || ("open" in this.props && this.props.open && !prevProps.open))
			this.setMenuPositions();

		if (this.isOpen() && this._performAutoCompleteOnUpdate) {
			this._performAutoCompleteOnUpdate = false;
			this.maybeAutoCompleteText();
		}

		this.maybeScrollItemIntoView();
		if (prevState.isOpen !== this.state.isOpen) {
			this.props.onMenuVisibilityChange(this.state.isOpen);
		}
	}

	exposeAPI(el) {
		IMPERATIVE_API.forEach(ev => this[ev] = (el && el[ev] && el[ev].bind(el)));
	}

	maybeScrollItemIntoView() {
		if (this.isOpen() && this.state.highlightedIndex !== null) {
			const itemNode = this.refs[`item-${this.state.highlightedIndex}`];
			const menuNode = this.refs.menu;
			if (itemNode) {
				menuNode.scrollIntoViewIfNeeded();
				itemNode.scrollIntoViewIfNeeded();
			}
		}
	}

	handleKeyDown(event) {
		const keyDownHandlers = {
			ArrowDown(event) {
				event.preventDefault();
				const itemsLength = this.getFilteredItems().length;
				if (!itemsLength)
					return;
				const {highlightedIndex} = this.state;
				let index = highlightedIndex === null ? 0 : highlightedIndex + 1;
				if (index >= itemsLength) {
					index = null;
				}
				this._performAutoCompleteOnKeyUp = true;
				this.setState({highlightedIndex: index, isOpen: true,});
			},

			ArrowUp(event) {
				event.preventDefault();
				const itemsLength = this.getFilteredItems().length;
				if (!itemsLength)
					return;
				const {highlightedIndex} = this.state;
				let index = highlightedIndex === null ? itemsLength - 1 : highlightedIndex - 1;
				if (index < 0) {
					index = null;
				}
				this._performAutoCompleteOnKeyUp = true;
				this.setState({highlightedIndex: index, isOpen: true,});
			},

			Enter(event) {
				if (!this.isOpen()) {
					// menu is closed so there is no selection to accept -> do nothing
					return;
				} else if (this.state.highlightedIndex === null) {
					// input has focus but no menu item is selected + enter is hit -> close the menu, highlight whatever's in input
					this.setState({
						isOpen: false
					});
					this.refs.input.select();
				} else {
					// text entered + menu item has been highlighted + enter is hit -> update value to that of selected menu item, close the menu
					event.preventDefault();
					const item = this.getFilteredItems()[this.state.highlightedIndex];
					const value = this.props.getItemValue(item);
					this.setState({
						isOpen: false,
						highlightedIndex: null
					});
					// TODO: what order should these be in?
					this.props.onSelect(value, item);
					this.refs.input.value = value;
					this.refs.input.select();
					this.update({...this.props, value});
					this.props.onChange({target: this.refs.input, type: "select"}, value);
				}
			},

			Escape() {
				// In case the user is currently hovering over the menu
				this.setIgnoreBlur(false);
				this.setState({highlightedIndex: null, isOpen: false});
			},

			Tab() {
				// In case the user is currently hovering over the menu
				this.setIgnoreBlur(false);
			},
		};

		if (keyDownHandlers[event.key])
			keyDownHandlers[event.key].call(this, event);
		else if (!this.isOpen()) {
			this.setState({isOpen: true});
		}
	}

	handleChange(event) {
		this._performAutoCompleteOnKeyUp = true;
		this.setState({highlightedIndex: null});
		this.props.onChange(event, event.target.value);
	}

	handleInput(event) {
		this.props.value = event.target.value;
		this.setState({highlightedIndex: null});
		this.props.onInput(event, event.target.value);
	}

	handleKeyUp() {
		if (this._performAutoCompleteOnKeyUp) {
			this._performAutoCompleteOnKeyUp = false;
			this.maybeAutoCompleteText();
		}
	}

	getFilteredItems() {
		let items = this.props.items;
		const value = this.props.value;
		const itemWeights = items.reduce((prev, item) => {
			prev[item] = this.props.getItemWeight(item, value);
			return prev;
		}, {});

		if (this.props.shouldItemRender) {
			items = items.filter((item) => (this.props.shouldItemRender(item, value, itemWeights[item])));
		}

		if (this.props.sortItems) {
			items.sort((a, b) => (this.props.sortItems(a, b, value, itemWeights[a], itemWeights[b])));
		}

		return items;
	}

	maybeAutoCompleteText() {
		// TODO: i'm not sure what this function is supposed to do
		if (!this.props.autoHighlight || this.props.value === "")
			return;
		const {highlightedIndex} = this.state;
		const items = this.getFilteredItems();
		if (items.length === 0)
			return;
		const matchedItem = highlightedIndex !== null ? items[highlightedIndex] : items[0];
		const itemValue = this.props.getItemValue(matchedItem);
		const itemValueDoesMatch = (itemValue.toLowerCase().indexOf(this.props.value.toLowerCase()) === 0);
		if (itemValueDoesMatch && highlightedIndex === null)
			this.setState({highlightedIndex: 0});
		}

	setMenuPositions() {
		const node = this.refs.input;
		const rect = node.getBoundingClientRect();
		const computedStyle = global.window.getComputedStyle(node);
		const marginBottom = parseInt(computedStyle.marginBottom, 10) || 0;
		const marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
		const marginRight = parseInt(computedStyle.marginRight, 10) || 0;
		this.setState({
			menuTop: rect.bottom + marginBottom,
			menuLeft: rect.left + marginLeft,
			menuWidth: rect.width + marginLeft + marginRight,
			menuPositionSet: true,
		});
	}

	highlightItemFromMouse(index) {
		this.setState({highlightedIndex: index});
	}

	selectItemFromMouse(item) {
		const value = this.props.getItemValue(item);
		this.setIgnoreBlur(false);
		this.setState({
			isOpen: false,
			highlightedIndex: null
		});
		// TODO: what order should these be in?
		this.props.onSelect(value, item);
		this.refs.input.value = value;
		this.refs.input.select();
		this.update({...this.props, value});
		this.props.onChange({target: this.refs.input, type: "select"}, value);
	}

	setIgnoreBlur(ignore) {
		this._ignoreBlur = ignore;
	}

	renderMenu() {
		if (!this.state.menuPositionSet) {
			return null;
		}

		const items = this.getFilteredItems().map((item, index) => {
			const element = this.props.renderItem(item, this.state.highlightedIndex === index, {cursor: "default"});
			element.props = {
				...element.props,
				onmouseenter: () => this.highlightItemFromMouse(index),
				onclick: () => this.selectItemFromMouse(item),
				ref: "item-" + index,
			};
			return element;
		});
		if (items.length === 0) {
			return null;
		}
		const style = {
			left: this.state.menuLeft + "px",
			top: this.state.menuTop + "px",
			minWidth: this.state.menuWidth + "px",
		};
		const menu = this.props.renderMenu(items, this.props.value, style);
		menu.props = {
			...menu.props,
			onmouseenter: () => this.setIgnoreBlur(true),
			onmouseleave: () => this.setIgnoreBlur(false),
			ref: "menu",
		};
		return menu;
	}

	handleInputBlur(event) {
		if (this._ignoreBlur) {
			this.refs.input.focus();
			return;
		}
		this.setState({isOpen: false, highlightedIndex: null});
		const {onBlur} = this.props.inputProps;
		if (onBlur) {
			onBlur(event);
		}
	}

	handleInputFocus(event) {
		if (this._ignoreBlur) {
			return;
		}
		if (event.target.value !== "") {
			this.setState({isOpen: true});
		}
		const {onFocus} = this.props.inputProps;
		if (onFocus) {
			onFocus(event);
		}
	}

	isInputFocused() {
		const el = this.refs.input;
		return el.ownerDocument && (el === el.ownerDocument.activeElement);
	}

	handleInputClick(ev) {
		if (this.state.menuPositionSet && this.state.menuTop <= ev.y) {
			// click was on menu not input
			return;
		}

		// Input will not be focused if it's disabled
		if (this.isInputFocused() && !this.isOpen())
			this.setState({isOpen: true});
		}

	composeEventHandlers(internal, external) {
		return external ? e => {
			internal(e);
			external(e);
		} : internal;
	}

	isOpen() {
		return ( "open" in this.props ? this.props.open : this.state.isOpen);
	}

	render() {
		const { inputProps, className } = this.props;
		const open = this.isOpen();
		return (
			<div style={this.props.wrapperStyle} {...this.props.wrapperProps} className={ className + " autocomplete" }>
				<input {...inputProps}
					className="native-key-bindings input-text autocomplete-input"
					attributes={{role: "combobox", "aria-autocomplete": "list", "aria-expanded": open, autoComplete: "off"}}
					tabIndex={this.props.tabIndex}
					ref="input"
					onfocus={this.handleInputFocus}
					onblur={this.handleInputBlur}
					onchange={this.handleChange}
					oninput={this.handleInput}
					onkeydown={this.composeEventHandlers(this.handleKeyDown, inputProps.onKeyDown)}
					onkeyup={this.composeEventHandlers(this.handleKeyUp, inputProps.onKeyUp)}
					onclick={this.composeEventHandlers(this.handleInputClick, inputProps.onClick)}
					value={this.props.value}/>
				{open ? this.renderMenu() : null}
			</div>
		);
	}
}
