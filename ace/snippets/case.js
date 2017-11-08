ace.define("ace/snippets/case",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText = "## Casefolders\n\
snippet CreateNewCasefolder\n\
	Casefolder ${1:cf} = new Casefolder(${2:template-name})${4:;}\n\
snippet FindCasefolderById\n\
	Casefolder.find(${1:decimalId})${2:;}\n\
snippet FindCasefolderByRepoKey\n\
	Casefolder.find(${1:repositoryKey})${2:;}\n\
##\n\
## Users\n\
snippet FindUserById\n\
	User.find(${1:userLoginId})${2:;}\n\
##\n\
## FileStore\n\
snippet CreateNewFileStore\n\
	Filestore ${1:fs} = new Filestore(${2:template-name})${4:;}\n\
snippet CreateNewFileStoreWithFilename\n\
	Filestore ${1:fs} = new Filestore(${2:template-name}, ${3:filename})${4:;}\n\
snippet FindFileStoreById\n\
	Filestore.find(${1:decimalId})${2:;}\n\
snippet FindFileStoreByRepoKey\n\
	Filestore.find(${1:repositoryKey})${2:;}\n\
##\n\
## FormData\n\
snippet CreateNewFormData\n\
	Formdata ${1:fd} = new Formdata(${2:template-name})${3:;}\n\
snippet FindFormDataById\n\
	Formdata.find(${1:templateId}, ${2:rowId})${3:;}\n\
snippet FindFormDataByRepoKey\n\
	Formdata.find(${1:repositoryKey})${2:;}\n\
##\n\
## JsonObject\n\
snippet CreateNewJsonObject\n\
	JsonObject ${1:jo} = new JsonObject(${2:jsonStringInput})${3:;}\n\
##\n\
## Comments\n\
snippet /*\n\
	/*\n\
	 * ${1}\n\
	 */\n\
##\n\
## List\n\
snippet CreateNewList\n\
	list {${1}}${2:;}\n\
##\n\
## RepositoryObject\n\
snippet FindRepositoryObjectByRepoKey\n\
	RepositoryObject.find(${1:repositoryKey})${2:;}\n\
##\n\
## Create a Variable\n\
snippet v\n\
	${1:String} ${2:var}${3: = null}${4};${5}\n\
##\n\
## Workitem\n\
snippet CreateNewWorkitem\n\
	Workitem ${1:wi} = new Workitem(${2:process}, ${3:run})${4:;}\n\
snippet CreateNewWorkitemWithVersion\n\
	Workitem ${1:wi} = new Workitem(${2:process}, ${3:run}, ${4:version})${5:;}\n\
snippet CreateNewWorkitemWithActivity\n\
	Workitem ${1:wi} = new Workitem(${2:process}, ${3:run}, ${4:version}, ${5:activity})${6:;}\n\
snippet FindWorkitemByRepoKey\n\
	Workitem.find(${1:repositoryKey})${2:;}\n\
snippet FindWorkitem\n\
	Workitem.find(${1:workflowId}, ${2:workitemId})${3:;}\n\
snippet FindWorkitemWithEnvelopeId\n\
	Workitem.find(${1:workflowId}, ${2:workitemId}, ${3:envelopeId})${4:;}\n\
##\n\
## Exception Handling\n\
snippet try\n\
	try {\n\
		${3}\n\
	} catch(${1:Exception} ${2:e}) {\n\
	}\n\
## Javadocs\n\
snippet CreateMetaData\n\
	// ${1:scriptName}\n\
	/**\n\
	* @Description  : ${2}\n\
	* @Param1       : ${3} \n\
	* @Return Value : ${4:None}\n\
	*\n\
	**/\n\
	// C h a n g e   H i s t o r y\n\
	// ____________________________________________________________________________________________________\n\
	// | Date       | Change by         | Change\n\
	// |____________|___________________|__________________________________________________________________\n\
	// | ${5} | ${6} | Original version\n\
	// |            |                   | \n\
	// \n\
snippet @Description\n\
	@Description   : ${1}\n\
snippet @Param\n\
	@Param${1:1}      : ${2}\n\
snippet @returnValue\n\
	@Return Value : ${1:None}\n\
snippet @ChangeHistory\n\
	// C h a n g e   H i s t o r y\n\
	// ____________________________________________________________________________________________________\n\
	// | Date       | Change by         | Change\n\
	// |____________|___________________|__________________________________________________________________\n\
	// | ${5} | ${6} | Original version\n\
	// |            |                   | \n\
##\n\
## Loops\n\
snippet foreach\n\
	for (${1} : ${2}) {\n\
		${3}\n\
	}\n\
snippet for\n\
	for (${1:i} = 0; ${1:i} < ${2}; ${1:i}++) {\n\
		${4}\n\
	}\n\
snippet while\n\
	while (${1}) {\n\
		${2}\n\
	}\n\
";
exports.scope = "case";

});
