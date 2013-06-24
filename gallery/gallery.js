var Photo = Backbone.Model.extend({
	
});

var PhotoList = Backbone.Collection.extend({
	model : Photo
});

var IndexView = Backbone.View.extend({
	
	el : $('#main'),
	
	indexTemplate: $("#indexTmpl").template(),
	
	render : function(){
		var el = this.el;
		el.empty();
		$.tmpl(this.indexTemplate, this.model.toArray()).appendTo(el);
		return this;
	}
	
});

var AlbumsView  = Backbone.View.extend({
	
	el : $('#main'),
	
	albumsTemplate :  $("#subindexTmpl").template(),
	
	render : function(){
		var el = this.el;
		el.empty();
		$.tmpl(this.albumsTemplate,this.model.toArray()).appendTo(el);
		return this;
	}
	
});

var Gallery = Backbone.Controller.extend({
	
	_index: null,
    _photos: null,
	_data : null,
	
	routes : {
		'' : 'index',
		'subalbum/:id' : 'ablums'
	},
	
	initialize : function(options){
		var that = this;
	
		$.ajax({
			url: 'data/album1.json',
			dataType: 'json',
			data: {},
			success: function(data) {
				that._data = data;
				that._photos = new PhotoList(data);
				that._index = new IndexView({model: that._photos}); 
				Backbone.history.loadUrl();

			}
		});
	},
	
	index : function(){
		if(this._index){
			this._index.render();
		}
	},
	
	ablums : function(id){
	
		var albumDataIndex = id.replace('c',''),
			albumData = this._data[albumDataIndex].subalbum;
		var ablumsCollection = new PhotoList(albumData);
		var albumsView = new AlbumsView({model : ablumsCollection});
		albumsView.render();
	}
	
});

var gallery = new Gallery();
Backbone.history.start();