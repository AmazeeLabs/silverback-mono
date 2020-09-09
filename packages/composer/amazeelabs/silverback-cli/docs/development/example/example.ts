import {
	LitElement,
	html,
	css,
	customElement,
} from "lit-element";

class Button extends LitElement {

	render() {
		return html`
		<div @click=${Button.clickHandler} class="button"><slot></slot></div>
		`;
	}

	static clickHandler() {
		window.alert('How dare you clicked me!')
	}
}

Button.styles = css`
.button {
	display: inline-block;
	padding: 1em;
	border-radius: 0.5em;
	background: lime;
	color: white;
	cursor: pointer;
}
`;

customElement('example-button')(Button);
