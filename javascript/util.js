// JavaScript Document
// add htmlEscape function to strings
String.prototype.htmlEscape = function() {
	return $('<div/>').text(this.toString()).html();
};


// open xml in new windows, prettyprintted
function viewRawXML(codeIn) {
	var w = window.open('', 'Raw View', 'width=800,height=600');
	w.document.write('<html>');
	w.document.write('<head>');
	w.document.write('<title>Raw View</title>');
	w.document.write('<style>');
	w.document.write('	body { line-height: 1.5; font-family: Arial;}');
	w.document.write('	li.L0, li.L1, li.L2, li.L3,li.L5, li.L6, li.L7, li.L8{ list-style-type: decimal !important }');
	w.document.write('</style>');
	w.document.write('<scr'+'ipt src="https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js?skin=sunburst"></scr'+'ipt>');
	w.document.write('</head>');
	w.document.write('<body>');
	w.document.write('	<pre class="prettyprint linenums" style="font-size: 1.25em; height: 95%; width: 95%">' + formatXml(codeIn) + '</pre>');
	w.document.write('</body>');
	w.document.write('</html>');
	w.document.close()
}

// ns_filter, a jQuery extension for XML namespace queries.
(function($) {
  $.fn.ns_filter = function(namespaceURI, localName) {
	return $(this).filter(function() {
		var domnode = $(this)[0];
		// have to use nodeName instead of localName to support ie8 (i.e. Windows XP)
		return (domnode.namespaceURI == namespaceURI && domnode.nodeName.split(":").pop() == localName);
	});
  };

})(jQuery);

// stacking alert bar
function showAlert(title, msg) {
	$("#alert-panel").append('<div class="alert" style="color: #990000;"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>' + title + '</strong>&nbsp;&nbsp;' + msg + '</div>');
}


// fix indents for xml views (takes xml string, not object)
function formatXml(xml) {
	var formatted = '';
	var reg = /(>)(<)(\/*)/g;
	xml = xml.toString().replace(reg, '$1\r\n$2$3');
	var pad = 0;
	jQuery.each(xml.split('\r\n'), function(index, node) {
		var indent = 0;
		if (node.match( /.+<\/\w[^>]*>$/ )) {
			indent = 0;
		} else if (node.match( /^<\/\w/ )) {
			if (pad != 0) {
				pad -= 2;
			}
		} else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
			indent = 2;
		} else {
			indent = 0;
		}

		var padding = '';
		for (var i = 0; i < pad; i++) {
			padding += '  ';
		}

		formatted += padding + node + '\r\n';
		pad += indent;
	});
	return formatted.htmlEscape();
};

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
};


/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}