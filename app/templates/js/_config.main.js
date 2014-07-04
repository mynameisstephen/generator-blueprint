require.config({
	'paths': {
		<%= dependencies.require.paths.join(',\n\t\t') %>
	},
	'deps': [
		<%= dependencies.require.deps.join(',\n\t\t') %>
	],
	'shim': {
		<%= dependencies.require.shim.join(',\n\t\t') %>
	}
});