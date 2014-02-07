(function($) {
	var loadFiles = function(path){
		Stevenson.ui.Loader.display('Loading files...', 100);
		
		Stevenson.repo.getFiles({
			path: path,
			success: function(files){
				window.location.hash = path;
				$('#files').attr('data-path', path);
				$('.breadcrumb .path').html(path);
				$('#files tbody').html('');
				$.each(files, function(index, file){
					if(file.path.indexOf('_config') != 0 && file.path.indexOf('_layouts') != 0 && file.path.indexOf('_editors') != 0){
						$('#files tbody').mustache('file', file);
					}
				});
				$('.folder-close').click(function(){
					loadFiles($(this).attr('data-path'));
				});
				$('#files input[type=checkbox]').click(function(){
					var checked = this;
					$('#files input[type=checkbox]').each(function(index, item){
						if(item != checked){
							$(item).removeAttr('checked');
						}
					});
				});
				Stevenson.ui.Loader.hide();
			},
			error: function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Unable to load branches: ' + message);
			}
		});
	};
	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Initializing files');
		
		$('.breadcrumb .repo').html(Stevenson.Account.repo);
		
		var path = window.location.hash;
		if(path != ''){
			path = path.substr(1);
		}
		$('.breadcrumb .path').html(path);
		loadFiles(path);
	});
	$(document).ready(function(){
		
		/**
		 * Support creating new files
		 */
		$('#new-file-modal .yes').click(function() {
			$('#new-file-modal .modal-body .alert-error').remove();
			var name = $('#file-name').val();
			if(name != ''){
				var path = $('#files').attr('data-path');
				var filePath = path + "/" + name;
				if(path == ""){
					filePath = name;
				}
				$('#new-file-modal .btn, #new-file-modal input').attr('disabled','disabled');
				Stevenson.repo.savePage({
					path: filePath,
					page: {
						content:''
						},
					message: 'Creating new page ' + name,
					success: function(){
						window.location = 'edit-page.html?new=true&path='+$('#files').attr('data-path')+'&page='+$('#files').attr('data-path') + '/' + name;
					},
					error: function(msg){
						$('#new-file-modal .btn, #new-file-modal input').removeAttr('disabled');
						$('#new-file-name').addClass('error');
						$('#new-file-modal .modal-body').prepend('<div class="alert alert-error">Error creating page: '+msg+'.</div>');
					}
				});
			} else {
				$('#new-file-name').addClass('error');
				$('#file-name-modal .modal-body').prepend('<div class="alert alert-error">Please enter a file name.</div>');
			}
		});
		$('#new-file-modal .no').click(function() {
			$('#new-file-modal').modal('hide');
		});
		$('.new').click(function(){
			$('#new-file-modal').modal({
				show: true
			});
			return false;
		});
		
		/**
		 * Support editing files
		 */
		$('.file-edit').click(function(){
			Stevenson.ui.Loader.display('Loading editor...', 100);
			var path = $('#files input[type=checkbox]:checked').parents('tr').attr('data-path');
			window.location = 'edit-page.html?page=' + path + '&path='+$('#files').attr('data-path');
			return false;
		});
		
		/**
		 * Support deleting files
		 */
		$('.file-delete').click(function(){
			$('#delete-file-modal').modal({
				show: true
			});
			var path = $('#files input[type=checkbox]:checked').parents('tr').attr('data-path');
			$('#delete-file-modal .yes').click(function(){
				$('#delete-file-modal').modal('hide');
				Stevenson.ui.Loader.display('Deleting...', 100);
				Stevenson.repo.deleteFile({
					path: path,
					success: function(path){
						Stevenson.ui.Messages.displayMessage("Deleted file: "+path);
						Stevenson.ui.Loader.hide();
						var path = window.location.hash;
						if(path != ''){
							path = path.substr(1);
						}
						loadFiles(path);
					},
					error: function(message){
						Stevenson.ui.Messages.displayError("Failed to delete file: "+path+" due to error "+message);
						Stevenson.ui.Loader.hide();
					}
				});
				return false;
			});
			$('#delete-file-modal .no').click(function(){
				$('#loading-modal').modal('hide');
				return false;
			});
		});
		
		/**
		 * Support moving files
		 */
		$('.file-move').click(function(){
			var path = $('#files input[type=checkbox]:checked').parents('tr').attr('data-path');
			$('#move-modal input').val(path);
			$('#move-modal').modal({
				show: true
			});
			return false;
		});
		$('#move-modal .no').click(function(){
			$('#move-modal').modal('hide');
			return false;
		});
		$('#move-modal .yes').click(function(){
			$('#move-modal').modal('hide');
			Stevenson.ui.Loader.display('Moving file...', 100);
			var oldPath = $('#move-modal #old-path').val();
			var newPath = $('#move-modal #new-path').val();
			Stevenson.repo.moveFile({
				oldPath: oldPath,
				newPath: newPath,
				success: function(path){
					Stevenson.ui.Messages.displayMessage("Moved file: "+oldPath +' to '+newPath);
					Stevenson.ui.Loader.hide();
					var path = window.location.hash;
					if(path != ''){
						path = path.substr(1);
					}
					loadFiles(path);
				},
				error: function(message){
					Stevenson.ui.Messages.displayError("Failed to move file from '"+oldPath+"' to '"+newPath+"' due to error "+message);
					Stevenson.ui.Loader.hide();
				}
			});
			return false;
		});
		

		/**
		 * Support copying files
		 */
		$('.file-copy').click(function(){
			var path = $('#files input[type=checkbox]:checked').parents('tr').attr('data-path');
			$('#copy-modal input').val(path);
			$('#copy-modal').modal({
				show: true
			});
			return false;
		});
		$('#copy-modal .no').click(function(){
			$('#copy-modal').modal('hide');
			return false;
		});
		$('#copy-modal .yes').click(function(){
			$('#copy-modal').modal('hide');
			Stevenson.ui.Loader.display('Copying file...', 100);
			var oldPath = $('#copy-modal #old-path').val();
			var newPath = $('#copy-modal #new-path').val();
			Stevenson.repo.copyFile({
				oldPath: oldPath,
				newPath: newPath,
				success: function(path){
					Stevenson.ui.Messages.displayMessage("Copied file: "+oldPath +' to '+newPath);
					Stevenson.ui.Loader.hide();
					var path = window.location.hash;
					if(path != ''){
						path = path.substr(1);
					}
					loadFiles(path);
				},
				error: function(message){
					Stevenson.ui.Messages.displayError("Failed to copy file from '"+oldPath+"' to '"+newPath+"' due to error "+message);
					Stevenson.ui.Loader.hide();
				}
			});
			return false;
		});
		
		/**
		 * Support File Uploads
		 */
		$('.file-upload').click(function(){
			var path = $('#files').attr('data-path');
			$('#upload-modal input').val(path);
			$('#upload-modal').modal({
				show: true
			});
			return false;
		});
		$('#upload-modal .yes').click(function(){
			$('#upload-modal').modal('hide');
			Stevenson.ui.Loader.display('Uploading file...', 100);
			
			var reader = new FileReader();
			reader.onload = function(e) {
				var name = $('#upload-modal .file').val().split(/(\\|\/)/g).pop();
				var page = new Page($('#upload-modal .path').val()+'/'+name, reader.result);
				Stevenson.repo.savePage({
					page: page,
					path: page.path,
					message: "Adding file: "+name,
					success: function(){
						Stevenson.ui.Messages.displayMessage("Successfully uploaded file "+name);
						Stevenson.ui.Loader.hide();
						loadFiles($('#files').attr('data-path'));
					},
					error: function(message){
						Stevenson.ui.Messages.displayError("Failed to upload file "+name+" due to exception: "+message);
						Stevenson.ui.Loader.hide();
					}
					
				});
			}
			reader.readAsBinaryString(document.getElementById('upload-file-input').files[0]);	
			return false;
		});
	});
})(jQuery);
