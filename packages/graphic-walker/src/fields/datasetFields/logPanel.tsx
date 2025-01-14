import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGlobalStore } from '../../store';
import SmallModal from '../../components/smallModal';
import PrimaryButton from '../../components/button/primary';
import DefaultButton from '../../components/button/default';
import { useTranslation } from 'react-i18next';
import { runInAction, toJS } from 'mobx';
import { ICreateField, IViewField } from '../../interfaces';
import { useRenderer } from '../../renderer/hooks';
import { applyViewQuery, transformDataService } from '../../services';

const FieldScalePanel: React.FC = (props) => {
    const { commonStore, vizStore } = useGlobalStore();
    const { showLogSettingPanel } = commonStore;
    const [baseNum, setBaseNum] = useState<string>('');
    const { t } = useTranslation();
    useEffect(() => {
        setBaseNum('');
    }, [showLogSettingPanel]);
    return (
        <SmallModal
            show={showLogSettingPanel}
            onClose={() => {
                commonStore.setShowLogSettingPanel(false);
            }}
        >
            <div className="flex flex-col justify-center items-start">
                <h2 className="font-medium text-xl my-2">Logarithm Transformation</h2>
                <p className="font-normal ">Set log config for field</p>
                <fieldset className="mt-2 gap-1 flex flex-col justify-center items-start">
                    <div className="flex items-center space-x-2">
                        <label className="text-ml whitespace-nowrap">Logarithmic base</label>
                        <input
                            type="text"
                            value={baseNum}
                            className="block w-full text-gray-700 dark:text-gray-200 rounded-md border-0 py-1 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 "
                            onChange={(e) => {
                                setBaseNum(e.target.value);
                            }}
                        />
                    </div>
                    <div className="mt-2">
                        <PrimaryButton
                            text={t("actions.confirm")}
                            className="mr-2 px-2 "
                            // text="Confirm"
                            onClick={() => {
                                const field = commonStore.createField as ICreateField;
                                vizStore.createLogField(field.channel, field.index, 'log', Number(baseNum));
                                commonStore.setShowLogSettingPanel(false);
                            }}
                        />
                        <DefaultButton
                            text={t('actions.cancel')}
                            className="mr-2 px-2"
                            onClick={() => {
                                commonStore.setShowLogSettingPanel(false);
                            }}
                        />
                    </div>
                </fieldset>
            </div>
        </SmallModal>
    );
};
export default observer(FieldScalePanel);
