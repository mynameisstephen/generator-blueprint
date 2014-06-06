require.config({
	'paths': {
		<%= depsVendorPaths %>
	},
	'deps': [
		<%= depsVendorLibs %>
	],
	'shim': {
		<%= depsVendorShims %>
	}
});