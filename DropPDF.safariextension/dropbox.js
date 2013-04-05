function Dropbox(key, secret) {
	this.key = key;
	this.secret = secret;
}

Dropbox.prototype.getRequestToken = function(callback) {
	var dp = this;
	
	var xhr = new XMLHttpRequest();
	xhr.open('POST', "https://api.dropbox.com/1/oauth/request_token", true);
	xhr.responseType = 'text';
	xhr.setRequestHeader("Authorization", "OAuth oauth_version=\"1.0\", oauth_signature_method=\"PLAINTEXT\", oauth_consumer_key=\"" + this.key + "\", oauth_signature=\"" + this.secret + "&\"");
	
	xhr.onload = function(e) {
		if (e.target.status == 200) {
			var result = e.target.responseText;
			
			var pos = result.search("oauth_token=") + 12;
			dp.requestToken = result.substr(pos);
			
			var amp = result.search("&");
			dp.requestSecret = result.substr(19, amp-19);
			
			callback();
		}
		else {
			console.log("error fetching request token");
		}
	};
	
	xhr.send();
};

Dropbox.prototype.getAccessToken = function(callback, error) {
	var dp = this;
	
	var xhr = new XMLHttpRequest();
	xhr.open('POST', "https://api.dropbox.com/1/oauth/access_token", true);
	xhr.responseType = 'text';
	xhr.setRequestHeader("Authorization", "OAuth oauth_version=\"1.0\", oauth_signature_method=\"PLAINTEXT\", oauth_token=\"" + this.requestToken + "\", oauth_consumer_key=\"" + this.key + "\", oauth_signature=\"" + this.secret + "&" + this.requestSecret + "\"");
	
	xhr.onload = function(e) {
		if (e.target.status == 200) {
			var result = e.target.responseText;
			
			var amp1 = result.search("&o");
			dp.accessSecret = result.substr(19, amp1-19);
			
			var amp2 = result.search("&u");
			dp.accessToken = result.substr(amp1 + 13, amp2 - (amp1+13));
			
			callback();
		}
		else {
			error(e.target.status);
		}
	};
	
	xhr.send();
};

Dropbox.prototype.getMetadata = function(path, callback) {
	var dp = this;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://api.dropbox.com/1/metadata/dropbox" + path, true);
	xhr.setRequestHeader("Authorization", "OAuth oauth_version=\"1.0\", oauth_signature_method=\"PLAINTEXT\", oauth_consumer_key=\"" + this.key + "\", oauth_token=\"" + this.accessToken + "\", oauth_signature=\"" + this.secret + "&" + this.accessSecret + "\"");
	
	xhr.onload = function(e) {
		if (e.target.status == 200) {
			var data = JSON.parse(this.response);
			
			callback(data);
		}
		else {
			console.log("error fetching metadata");
		}
	};
	
	xhr.send();
};

Dropbox.prototype.put = function(path, data, callback) {
	var dp = this;
	
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', "https://api-content.dropbox.com/1/files_put/dropbox" + path, true);
	xhr.setRequestHeader("Authorization", "OAuth oauth_version=\"1.0\", oauth_signature_method=\"PLAINTEXT\", oauth_consumer_key=\"" + this.key + "\", oauth_token=\"" + this.accessToken + "\", oauth_signature=\"" + this.secret + "&" + this.accessSecret + "\"");
	
	xhr.onload = function(e) {
		if (e.target.status == 200) {
			callback();
		}
		else {
			console.log("error putting data");
		}
	};
	
	xhr.send(data);
};
