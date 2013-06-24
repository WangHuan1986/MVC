$(function(){
	
	var Todo = Backbone.Model.extend({
		defaults : {
			done : false,
			title : ''
		},
		toggle : function(){
			this.save({done : !this.get('done')});
		}
	});
	
	var TodoList = Backbone.Collection.extend({
		
		model : Todo,
		
		localStorage : new Backbone.LocalStorage('todos'),
		
		initialize : function(){
		
		},
		
		doneList : function(){
			var list = this.filter(function(mod){
				return mod.get('done');
			});
			
			return list;
		},
		
		undoneList : function(){
			return this.without.apply(this,this.doneList());
		}
		
	});
	
	var todoList = new TodoList();
	
	var ItemView  = Backbone.View.extend({
		
		tagName : 'li',
		
		events : {
			'click .toggle' : 'toggle',
			'click .destroy': 'destroy',
			'dblclick' : 'edit',
			'blur .edit' : 'close'
		},
		
		itemTemplate : _.template($('#item-template').html()),
		
		initialize : function(){
			//_.bindAll(this,'render');
			//视图与模型的绑定，使用listenTo这个方法，不要直接用model.on这样去监听
			//因为这样语义化不好，而且render中的上下文是model，而不是视图
			//我们在视图的初始化方法里面监听模型的改变
			this.listenTo(this.model,'change',this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},
		
		toggle : function(e){
			this.model.toggle();
		},	
		
		destroy : function(e){
			this.model.destroy();
		},
		
		edit : function(e){

			var item = this.$el,
				view = item.find('.view'),
				edit = item.find('.edit');
			view.hide();
			edit.show();
			this.$el.find('.edit').focus();
		},
		
		close : function(e){
			
			var item = this.$el,
				view = item.find('.view'),
				edit = item.find('.edit');
			this.model.save({title : edit.val()});
			view.show();
			edit.hide();
		},
		
		render : function(){
			var el = this.$el,
				mod = this.model;
			el.html(this.itemTemplate(mod.toJSON()));
			if(mod.get('done')){
				el.addClass('done');
			}
			else{
				el.removeClass('done');
			}
			
			return this;
		
		}
		
	});
	
	var AppView = Backbone.View.extend({
		
		el : $('#todoapp'),
		
		statusTemplate : _.template($('#stats-template').html()),
		
		events : {
			'keypress #new-todo' : 'onenterpress',
			'click #toggle-all' : 'finishAll',
			'click #clear-completed' : 'clearFinished'
		},
		
		initialize : function(){
			//当集合fetch的时候，如果有新的Model加入，则会触发add事件
			this.listenTo(todoList, 'add', this.createItem);
			this.listenTo(todoList, 'all', this.render);
			this.main = $('#main');
			this.footer = $('footer');
			this.checkall = $('#toggle-all');
			todoList.fetch();
		},
		
		onenterpress : function(e){
			if(e.keyCode == 13){
				var input = $('#new-todo');
				todoList.create({title : input.val()});
				input.val('');
			}
		},
		
		clearFinished : function(){
			//调用模型的destroy方法，注意这个不是触发对象的事件，而是直接调用方法
			//model的destroy会产生destroy事件，这个事件会冒泡到包含它的集合
			//在这里迭代model集合并调用model的destroy方法，destroy事件发生后，todoView中的监听器就会执行，这样视图相关的dom就被删除了
			_.invoke(todoList.doneList(), 'destroy');
			return false;
		},
		
		finishAll : function(){
			var that = this;
			var done = !!that.checkall.attr('checked');
			todoList.each(function(mod){
				mod.save({done : done});
			});
		},
		
		createItem : function(todo){
			//建立视图与模型的关联，并更新视图
			//在父视图中会创造子视图的实例，并建立与之对应的关联。然后手动调用子视图的渲染函数
			var itemView = new ItemView({model : todo});
			$('#todo-list').append(itemView.render().$el);
		},
		
		render : function(a,b,c){
			//所有的模型上发生的事件都会冒泡到集合上，以下逻辑只有在发生这几个事件的时候才有用，所以只关注这几个事件
			if(a == 'add' ||  a == 'destroy' || a == 'change'){
				var remaining = todoList.undoneList().length;
				if(todoList.length > 0){
					this.footer.html(this.statusTemplate({done : todoList.doneList().length , remaining : remaining}));
					this.footer.show();
					this.main.show();
				}
				else{
					this.footer.hide();
					this.main.hide();
				}
				
				this.checkall[0].checked = !remaining;
			}
		}
		
	});
	
	new AppView();
	
});