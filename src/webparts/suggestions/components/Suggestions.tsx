import * as React from 'react';
import styles from './Suggestions.module.scss';
import { ISuggestionsProps } from './ISuggestionsProps';
import commonStyles from '../../../common.module.scss';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import {  Modal } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { TextField } from '@fluentui/react/lib/TextField';
// import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Dialog,  DialogFooter } from '@fluentui/react/lib/Dialog';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { dragOptions, iconClass } from '../../../helpers/constants';

import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import { IItemAddResult } from "@pnp/sp/items";

import { IconButton } from '@fluentui/react/lib/components/Button/IconButton/IconButton';
import { ResponsiveMode } from '@fluentui/react/lib/ResponsiveMode';
import {iconButtonStyles, modalProps, infoDialogProps } from '../../../helpers/constants'
import * as strings from 'SuggestionsWebPartStrings';

export interface ILink {
  title: string;
  description: string;
  fabricIcon: string;
  linkUrl: string;
  iconUrl: string;
  key: number;
}

const Suggestions:React.FC<ISuggestionsProps> = (props)  => {
  const [title, setTitle] = React.useState<string>('');
  const [subText, setSubText] = React.useState<string>('');
  const [dialogTitle, setDialogTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [isDialogOpen, { setTrue: showDialog, setFalse: hideDialog }] = useBoolean(false);
  const [isSaving, { setTrue: startSaving, setFalse: endSaving }] = useBoolean(false);
  const [files, setFiles] = React.useState<any[]>([]);
  // const [keepInBounds, { toggle: toggleKeepInBounds }] = useBoolean(false);

  const removeFile = (index:number):void => {
    const fileList =[...files];
    fileList.splice(index,1);
    setFiles(fileList);
  }
  const clearData = ():void => {
    setTitle(''); setDescription(''); setFiles([]); hideModal();  
  }

  const saveForm = async ():Promise<void> => {
    if (!description) {
      setDialogTitle(strings.InfoTitle)
      setSubText(strings.NoEmpty)
      showDialog();
      return;
    }
    if (!props.listId) {
      setSubText("Attention")
      setSubText('Suggestion List is not selected. Contact your administrator')
      showDialog();
      return;
    }
    startSaving();
    const sp = spfi().using(SPFx(props.context));
    const newItem: IItemAddResult = await sp.web.lists.getById(props.listId).items.add({Title: title,Suggestion: description});    
    for (let i = 0; i < files.length; i++) {
      await newItem.item.attachmentFiles.add(files[i].name, files[i].data).catch(console.error);        
    }
    endSaving();
    clearData();    
    setSubText(strings.SentMessage)
    setDialogTitle(strings.SentTitle)
    showDialog();
  }

  const handleFilePicker = (fileList:FileList):void => {
    if (!fileList.length) return;    
    const file = fileList[0];
    if (files.length && files.some(f=>f.name === file.name)) return;
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    startSaving();
    fileReader.onloadend = (e) => {
      setFiles ([...files, {name:file.name, data:e.target.result}]);
      endSaving();
    }
  }
    return (
        <div className={`${commonStyles.container} ${commonStyles.bg_logo} ${commonStyles.bg_logo_round}`} style={{maxHeight:"190px",marginTop:"-25px",minHeight:"190px"}}>   
        <div className={commonStyles.container_header}>   
          <img src={require('../../../assets/icon_link.svg')} alt="Useful Links"/>
          <div>{props.title}</div>
        </div>
        <div className={commonStyles.container_body} >
          <div className={styles.suggestion} style={{maxHeight:"110px",minHeight:"110px"}}>
            <p className={styles.suggestion_text} style={{marginTop:"-5"}}>{props.description}</p>
            <PrimaryButton
              text={props.buttonLabel}
              iconProps={ { iconName: 'DoubleChevronLeftMed' }}
              allowDisabledFocus
              className={styles.suggestion_button}
              onClick={showModal} 
              style={{marginBottom:'3px'}}
            />
          </div>            
        </div>  
        <Modal
          titleAriaId='SuggestionModal'
          isOpen={isModalOpen}
          onDismiss={hideModal}
          isBlocking={false}
          containerClassName={styles.modal}
          dragOptions={dragOptions}
          responsiveMode={ResponsiveMode.medium}          
        >
        <div className={styles.modal_header}>
          <div/>
          <h2 className={styles.modal_heading} id='SuggestionModal'>{strings.PopUpTitle}</h2>
          <IconButton
            styles={iconButtonStyles}            
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Close popup modal"
            onClick={clearData}
          />
        </div>
        <div className={styles.modal_body}>
          <TextField dir="rtl" label={strings.Title} value={title} onChange={(e,value)=>setTitle(value)}/> 
          <TextField dir="rtl" label={strings.Description} multiline autoAdjustHeight value={description} onChange={(e,value)=>setDescription(value)}/>
          <div className={styles.filePicker}>            
              <div>
                <input onChange={(ev)=>handleFilePicker(ev.target.files)} type="file" style={{display:'none'}} id='uploadFiles' disabled={isSaving}/>
                <label htmlFor='uploadFiles' className={`${commonStyles.defaultButton} ${commonStyles.uploadButton}`}> 
                  <FontIcon aria-label="Upload" iconName="Upload" className={iconClass} />
                  <span>{strings.UploadFile}</span>
                </label>
              </div>

            <ul >
              {files.map((x,i)=>(
                <li key="x.fileName">                  
                  {x.name} 
                  <IconButton
                    styles={iconButtonStyles}            
                    iconProps={{ iconName: 'Cancel' }}
                    ariaLabel="Remove file"
                    onClick={()=>removeFile(i)}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.modal_footer}>
            <PrimaryButton
              text={strings.Submit}
              iconProps={ { iconName: 'MailForward' }}
              allowDisabledFocus
              className={commonStyles.submitButton}
              onClick={saveForm} 
              disabled={isSaving}
            />
          </div>
          {isSaving && <Spinner size={SpinnerSize.large} style={{marginTop:16}}/>}
        </div>
      </Modal>
      <Dialog
        hidden={!isDialogOpen}
        onDismiss={hideDialog}
        dialogContentProps={{...infoDialogProps, subText, title: dialogTitle} }
        modalProps={modalProps}
      >
        <DialogFooter>
          <PrimaryButton onClick={hideDialog} text={strings.Ok} />          
        </DialogFooter>
      </Dialog>        
      </div>
    );
  }

export default Suggestions
