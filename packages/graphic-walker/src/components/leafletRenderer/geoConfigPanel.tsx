import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../spinner';
import { useGlobalStore } from '../../store';
import Modal from '../modal';
import PrimaryButton from '../button/primary';
import DefaultButton from '../button/default';
import type { IGeoUrl, Topology } from '../../interfaces';

const GeoConfigPanel: React.FC = (props) => {
    const { commonStore, vizStore } = useGlobalStore();
    const { showGeoJSONConfigPanel } = commonStore;
    const { visualConfig } = vizStore;
    const { geoKey, geojson, geoUrl } = visualConfig;
    const { t: tGlobal } = useTranslation('translation');
    const { t } = useTranslation('translation', { keyPrefix: 'main.tabpanel.settings' });

    const [dataMode, setDataMode] = useState<'GeoJSON' | 'TopoJSON'>(geoUrl?.type ?? 'GeoJSON');
    const [featureId, setFeatureId] = useState('');
    const [url, setUrl] = useState(geoUrl?.url ?? '');
    const [geoJSON, setGeoJSON] = useState('');
    const [topoJSON, setTopoJSON] = useState('');
    const [topoJSONKey, setTopoJSONKey] = useState('');
    const [loadedUrl, setLoadedUrl] = useState<IGeoUrl | undefined>(geoUrl);
    const [loading, setLoading] = useState(false);

    const defaultTopoJSONKey = useMemo(() => {
        try {
            const value = JSON.parse(topoJSON) as Topology;
            return Object.keys(value.objects)[0] || '';
        } catch (error) {
            return '';
        }
    }, [topoJSON]);

    useEffect(() => {
        setFeatureId(geoKey || '');
    }, [geoKey]);

    useEffect(() => {
        setGeoJSON(geojson ? JSON.stringify(geojson, null, 2) : '');
    }, [geojson]);

    const handleSubmit = () => {
        try {
            const json = JSON.parse(dataMode === 'GeoJSON' ? geoJSON : topoJSON);
            if (dataMode === 'TopoJSON') {
                vizStore.setGeographicData(
                    {
                        type: 'TopoJSON',
                        data: json,
                        objectKey: topoJSONKey || defaultTopoJSONKey,
                    },
                    featureId,
                    loadedUrl?.type === 'TopoJSON' ? loadedUrl : undefined
                );
            } else {
                vizStore.setGeographicData(
                    {
                        type: 'GeoJSON',
                        data: json,
                    },
                    featureId,
                    loadedUrl?.type === 'GeoJSON' ? loadedUrl : undefined
                );
            }
            commonStore.setShowGeoJSONConfigPanel(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Modal show={showGeoJSONConfigPanel} onClose={() => commonStore.setShowGeoJSONConfigPanel(false)}>
            <div>
                <h2 className="text-lg mb-4">{t('geography')}</h2>
                <div>
                    <div className="my-2">
                        <label className="block text-xs font-medium leading-6 text-gray-900">{t('geography_settings.geoKey')}</label>
                        <div className="mt-1">
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={featureId}
                                onChange={(e) => setFeatureId(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="my-2">
                        <label className="block text-xs font-medium leading-6 text-gray-900">{t(`geography_settings.${dataMode.toLowerCase()}`)}</label>
                        <div className="mt-1 flex flex-col space-y-2">
                            <div role="radiogroup">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="dataMode"
                                        id="geojson"
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                                        checked={dataMode === 'GeoJSON'}
                                        onChange={() => {
                                            setDataMode('GeoJSON');
                                        }}
                                    />
                                    <label htmlFor="geojson" className="text-xs whitespace-nowrap">
                                        {t('geography_settings.geojson')}
                                    </label>
                                    <input
                                        type="radio"
                                        name="dataMode"
                                        id="topojson"
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                                        checked={dataMode === 'TopoJSON'}
                                        onChange={() => {
                                            setDataMode('TopoJSON');
                                        }}
                                    />
                                    <label htmlFor="topojson" className="text-xs whitespace-nowrap">
                                        {t('geography_settings.topojson')}
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-xs whitespace-nowrap capitalize">
                                    {t('geography_settings.href', { format: dataMode.toLowerCase() })}
                                </label>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={url}
                                    placeholder={t('geography_settings.hrefPlaceholder', { format: dataMode.toLowerCase() })}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                    }}
                                />
                                <DefaultButton
                                    text={t('geography_settings.load')}
                                    className="mr-2"
                                    disabled={loading}
                                    icon={loading ? <Spinner className='text-black' /> : undefined}
                                    onClick={() => {
                                        if (url) {
                                            setLoading(true);
                                            fetch(url)
                                                .then((res) => res.json())
                                                .then((json) => {
                                                    (dataMode === 'GeoJSON' ? setGeoJSON : setTopoJSON)(JSON.stringify(json, null, 2));
                                                    setLoadedUrl({ type: dataMode, url });
                                                    setLoading(false);
                                                })
                                                .catch(() => {
                                                    setLoading(false);
                                                });
                                        }
                                    }}
                                />
                            </div>
                            <textarea
                                className="block w-full h-40 rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                                value={dataMode === 'GeoJSON' ? geoJSON : topoJSON}
                                placeholder={t('geography_settings.jsonInputPlaceholder', { format: dataMode.toLowerCase() })}
                                onChange={(e) => {
                                    (dataMode === 'GeoJSON' ? setGeoJSON : setTopoJSON)(e.target.value);
                                    if (loadedUrl?.type === dataMode) {
                                        setLoadedUrl(undefined);
                                    }
                                }}
                            />
                            {dataMode === 'TopoJSON' && (
                                <div className="flex items-center space-x-2">
                                    <label className="text-xs whitespace-nowrap capitalize">{t('geography_settings.objectKey')}</label>
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={topoJSONKey}
                                        placeholder={defaultTopoJSONKey}
                                        onChange={(e) => {
                                            setTopoJSONKey(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <PrimaryButton text={tGlobal('actions.confirm')} className="mr-2" onClick={handleSubmit} />
                    <DefaultButton
                        text={tGlobal('actions.cancel')}
                        className="mr-2"
                        onClick={() => {
                            commonStore.setShowGeoJSONConfigPanel(false);
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default observer(GeoConfigPanel);
