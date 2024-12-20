
        // MapLibre GL JS 地図の初期化
        const map = new maplibregl.Map({
            container: 'map',  // 地図を表示する要素のID
            style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',  // OSMのスタイル
            center: [139.6917, 35.6895],  // 東京の中心座標
            zoom: 10  // 初期ズームレベル
        });

        // GeoJSONファイルとアイコン画像のパス
        const polygonGeoJsonUrl = './東京都（本島のみ）_行政区域_4326v2.geojson';//行政区 
        const lineGeoJsonUrl = './東京都_路線_R5_4326v6.geojson';//鉄道路線
        const pointGeoJsonUrl = './東京都_公園_2011年度（平成23年年度）.geojson';//公園ポイント
        const point1GeoJsonUrl = './東京都_駅_4326_4.geojson'//東京駅ポイント;
        const parkGeoJsonUrl = './文京区_公園.geojson';//文京区公園ポイント;
        const iconUrl = './公園アイコン.png';  // アイコン画像のパス
       const bunkyo_iconUrl ='./文京区_公園.png';


        // 地図の読み込みが完了したらGeoJSONデータを追加
        map.on('load', () => {

//1.行政区域 GeoJsonデータ追加
            fetch(polygonGeoJsonUrl)
                .then(response => response.json())
                .then(data => {
                    map.addSource('polygon-source', { type: 'geojson', data: data });
                    map.addLayer({
                        id: 'polygon-outline-layer',
                        type: 'line',
                        source: 'polygon-source',
                        paint: {
                            'line-color': '#000000',
                            'line-width': 2
                        }
                    });
                })
                .catch(error => console.error('Polygon GeoJSONの読み込みに失敗しました:', error));

                
                fetch(lineGeoJsonUrl)
                .then(response => response.json())
                .then(data => {
        // GeoJSONソースを追加
                map.addSource('line-source', { type: 'geojson', data: data });

        // 線レイヤーを追加
                map.addLayer({
                    id: 'line-layer',
                    type: 'line',
                    source: 'line-source',
                    paint: {
                    'line-color': ['get', '色'], // GeoJSONのプロパティ「色」を使用
                    'line-width': 3,
                    'line-opacity': 0.8
                },
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
            }
        });

        // クリックイベント
            map.on('click', 'line-layer', (e) => {
            const lineCoordinates = e.lngLat; // クリックされた位置の座標を取得
            const lineProperties = e.features[0].properties;
            const lineName = lineProperties['路線名'] || '路線';

            // ポップアップの作成と表示
            new maplibregl.Popup()
                .setLngLat(lineCoordinates)
                .setHTML(`<div><h3>${lineName}</h3></div>`)
                .addTo(map);
             });

        // マウスオーバーでカーソルをポインタに変更
            map.on('mouseenter', 'line-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'line-layer', () => {
            map.getCanvas().style.cursor = '';
                });
            })
            .catch(error => console.error('Line GeoJSONの読み込みに失敗しました:', error));

 // 2. 駅ポイント GeoJSON Layer
            fetch(point1GeoJsonUrl)
                .then(response => response.json())
                .then(data => {
                    // GeoJSONデータをソースとして追加
                map.addSource('point1-source', { type: 'geojson', data: data });

        // ポイントの外枠（ストローク）を設定
                map.addLayer({
                    id: 'point1-outline-layer',
                    type: 'circle',
                    source: 'point1-source',
                    paint: {
                'circle-radius': 8, // ポイントの大きさ（外枠のため少し大きめに設定）
                'circle-color': '#000000', // 外枠の色
                }
            });

        // ポイントの塗りつぶし（fill）を設定
                map.addLayer({
                    id: 'point1-fill-layer',
                    type: 'circle',
                    source: 'point1-source',
                    paint: {
                    'circle-radius': 6, // 塗りつぶしの半径（外枠より小さくする）
                    'circle-color': '#ffffff' // 塗りつぶし色
                }
            });
        
         // 駅ポイントをクリックしたときのポップアップ
                         map.on('click', 'point1-fill-layer', (e) => {
                            const StCoordinates = e.features[0].geometry.coordinates.slice();
                            const StProperties = e.features[0].properties;
                            const StName = StProperties['駅名'] || '駅名';

                            // ポップアップの作成と表示
                            new maplibregl.Popup()
                                .setLngLat(StCoordinates)
                                .setHTML(`<div><h3>${StName}</h3></div>`)
                                .addTo(map);
                        });

                      

                        // マウスオーバーでカーソルをポインタに変更
                        map.on('mouseenter', 'point1-fill-layer', () => {
                            map.getCanvas().style.cursor = 'pointer';
                        });
                        map.on('mouseleave', 'point1-fill-layer', () => {
                            map.getCanvas().style.cursor = '';
                        });
                    })
                    .catch(error => console.error(' GeoJSONの読み込みに失敗しました:', error));
        
 

// 3. 公園 GeoJSON Layer (画像アイコンのポイント)
            map.loadImage(iconUrl, (error, image) => {
                if (error) throw error;
                map.addImage('park-icon', image);

                fetch(pointGeoJsonUrl)
                    .then(response => response.json())
                    .then(data => {
                        map.addSource('point-source', { type: 'geojson', data: data });
                        map.addLayer({
                            id: 'point-layer',
                            type: 'symbol',
                            source: 'point-source',
                            layout: {
                                'icon-image': 'park-icon',
                                'icon-size': 0.03,
                                'icon-allow-overlap': true
                            }
                        });

                        // ポイントをクリックしたときのポップアップ
                        map.on('click', 'point-layer', (e) => {
                            const coordinates = e.features[0].geometry.coordinates.slice();
                            const properties = e.features[0].properties;
                            const parkName = properties['公園名'] || '公園';

                            // ポップアップの作成と表示
                            new maplibregl.Popup()
                                .setLngLat(coordinates)
                                .setHTML(`<div><h3>${parkName}</h3></div>`)
                                .addTo(map);
                        });

                      

                        // マウスオーバーでカーソルをポインタに変更
                        map.on('mouseenter', 'point-layer', () => {
                            map.getCanvas().style.cursor = 'pointer';
                        });
                        map.on('mouseleave', 'point-layer', () => {
                            map.getCanvas().style.cursor = '';
                        });
                    })
                    .catch(error => console.error('Point GeoJSONの読み込みに失敗しました:', error));

                    
            });

//4.文京区_公園
            map.loadImage(bunkyo_iconUrl, (error, image) => {
                if (error) throw error;
                map.addImage('park1-icon', image);

                fetch(parkGeoJsonUrl)
                    .then(response => response.json())
                    .then(data => {
                        map.addSource('park-source', { type: 'geojson', data: data });
                        map.addLayer({
                            id: 'park-layer',
                            type: 'symbol',
                            source: 'park-source',
                            layout: {
                                'icon-image': 'park1-icon',
                                'icon-size': 0.03,
                                'icon-allow-overlap': true,
                                
                                
                            },
                            paint: {
                                'icon-opacity':1//不透明度100%

                            }
                        });

                        // ポイントをクリックしたときのポップアップ
                        
                        let popup = new maplibregl.Popup({
                            closeButton: true, // ポップアップに閉じるボタンを追加
                            closeOnClick: false // 他の場所をクリックしてもポップアップが閉じない
                        });
                        
                        
                        
                        
                        map.on('click', 'park-layer', (e) => {
                            const coordinates1 = e.features[0].geometry.coordinates.slice();
                            const properties = e.features[0].properties;
                            const park1Name = properties['施設名'] || '施設';
                            const imageUrl = properties.png && properties.png.trim() ? properties.png :'./NO IMAGE.png';



                            const popupContent1 =
                            `<div>
                            <h3>${park1Name}</h3>
                            <img src="${imageUrl}" alt="画像" style="width:200px;height:auto;"/>

                            </div>
                            `;

                            // ポップアップの作成と表示
                            new maplibregl.Popup()
                            .setLngLat(coordinates1)
                            .setHTML(popupContent1)
                            .addTo(map);
                        });

                      

                        // マウスオーバーでカーソルをポインタに変更
                        map.on('mouseenter', 'park-layer', () => {
                            map.getCanvas().style.cursor = 'pointer';
                        });
                        map.on('mouseleave', 'park-layer', () => {
                            map.getCanvas().style.cursor = '';
                        });
                    })
                    .catch(error => console.error('Point GeoJSONの読み込みに失敗しました:', error));
                    
                    //公園の透過度を調整するスライダー
                    
                    
            });



            document.getElementById('point-layer-toggle').addEventListener('change', (e) => {
                const visibility = e.target.checked ? 'visible' : 'none';
                map.setLayoutProperty('point-layer', 'visibility', visibility);
            });

        });
