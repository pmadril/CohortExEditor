(function($) {
	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Initializing account');

		// Loads the branches and sets the selected branch to the specified
		// branch
		var loadBranches = function(repoName, currentBranch) {
			Stevenson.log.debug('loading branches for: '+repoName);
			$('#branch').html('<option>Please select a Branch</option>');
			Stevenson.repo.getBranches({
				repoName: repoName,
				success: function(branches){
					Stevenson.log.debug('Loaded branches: '+branches);
					$.each(branches, function(index, branch) {
						$('#branch').append(
								'<option value="' + branch + '">'
										+ branch + '</option>');
					});
					$('#branch option[value="' + currentBranch + '"]').attr(
							'selected', 'selected');
					Stevenson.ui.Loader.hide();
				},
				error: function(err){
					Stevenson.ui.Messages.displayError('Unable to load branches: '
							+ err);
					Stevenson.ui.Loader.hide();
				}
			});
		};

		Stevenson.ui.Loader.display('Loading available repos...', 50);
		// Retrieve the list of repositories
		Stevenson.repo.getRepos({
			success: function(repos){
				$('#repo').html('<option>Please select a Repo</option>');
				$.each(repos, function(index, repo) {
					$('#repo').append(
							'<option value="' + repo['full_name'] + '">'
									+ repo['full_name'] + '</option>');
				});
				Stevenson.ui.Loader.hide();
				if (Stevenson.Account.repo != '') {
					$('#repo option[value="' + Stevenson.Account.repo + '"]').attr(
							'selected', 'selected');
					Stevenson.ui.Loader.display('Loading available branches...', 75);
					loadBranches(Stevenson.Account.repo, Stevenson.Account.branch);
				}
			}, 
			error: function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Unable to load repos: '
						+ message);
			}
		});

		// handle when the repository changes
		$('#repo').change(function() {
			var repo = $('#repo').val();
			Stevenson.ui.Loader.display('Loading available branches...', 100);
			loadBranches(repo, '');
		});

		// save the current info into local storage
		$('form#account').submit(function() {
			Stevenson.Account.repo = $('#repo').val();
			Stevenson.Account.branch = $('#branch').val();
			Stevenson.Account.save();
			Stevenson.ui.Messages.displayMessage('Changed saved to account');
			return false;
		});
	});
})(jQuery);