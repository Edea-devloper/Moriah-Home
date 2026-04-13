import { ContextualMenu } from "@fluentui/react/lib/components/ContextualMenu";
import { DialogType } from "@fluentui/react/lib/components/Dialog";
import { IDragOptions, IModalProps } from "@fluentui/react/lib/components/Modal";
import { mergeStyles } from "@fluentui/react/lib/Styling";
import commonStyles from '../common.module.scss';


// export const theme = getTheme();
export const theme: any = (window as any).__themeState__.theme;
export const iconButtonStyles = {
    root: {
        color: theme.neutralPrimary,
        marginLeft: '4px',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: theme.neutralDark,
    },
};

export const modalProps:IModalProps = {
    titleAriaId: 'InfoDialog',
    subtitleAriaId: 'subTextId',
    isBlocking: false,
    containerClassName: commonStyles.dialog_container,
};

export const infoDialogProps = {
    type: DialogType.normal,
    title: 'Info',
    closeButtonAriaLabel: 'Close',
    subText: '',
};

export const dragOptions: IDragOptions = {
    moveMenuItemText: 'Move',
    closeMenuItemText: 'Close',
    menu: ContextualMenu,
    dragHandleSelector: '.ms-Modal-scrollableContent > div:first-child',
};

export const iconClass = mergeStyles({
    fontSize: 14,
    height: 14,
    width: 14,
    margin: '0 3px',   
});

