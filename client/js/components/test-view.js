define(function() {
    var _ = require('../util/underscore');
    
    return function TestView() {
        return {
            _: {
                isStaticPosition: true,
                'z-index': 1000,
                position: {
                    x: 50,
                    y: 50
                },
                width: 600,
                height: 400,
                title: 'Test Statistics',
                testResults: {
                    unit: [],
                    integration: [],
                    continuity: []
                },
                metrics: {
                    fps: [],
                    memory: [],
                    entities: [],
                    components: []
                },
                maxDataPoints: 100,
                updateInterval: 1000, // 1 second
                lastUpdate: 0
            },
            requiredComponents: ['window'],
            onAdd: function(entity, component) {
                // Initialize window
                entity.sendMessage('set-title', { title: this.title });
                
                // Create tabs
                this.$tabs = $('<div class="test-tabs" style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #444;"></div>');
                this.$content = $('<div class="test-content"></div>');
                
                const tabs = [
                    { id: 'unit', label: 'Unit Tests' },
                    { id: 'integration', label: 'Integration Tests' },
                    { id: 'continuity', label: 'Continuity Tests' },
                    { id: 'metrics', label: 'Performance Metrics' }
                ];
                
                tabs.forEach(tab => {
                    const $tab = $(`<div class="test-tab" data-tab="${tab.id}" style="padding: 5px 10px; cursor: pointer; border: 1px solid #444; margin-right: 5px; border-radius: 3px 3px 0 0;">${tab.label}</div>`);
                    this.$tabs.append($tab);
                });
                
                // Create content areas
                this.$tabContents = {};
                tabs.forEach(tab => {
                    this.$tabContents[tab.id] = $(`<div class="tab-content" data-tab="${tab.id}" style="display: none;"></div>`);
                    this.$content.append(this.$tabContents[tab.id]);
                });
                
                // Set up tab switching
                this.$tabs.on('click', '.test-tab', (e) => {
                    const tabId = $(e.target).data('tab');
                    this.$tabs.find('.test-tab').removeClass('active');
                    $(e.target).addClass('active');
                    this.$content.find('.tab-content').hide();
                    this.$tabContents[tabId].show();
                });
                
                // Show first tab by default
                this.$tabs.find('.test-tab').first().click();
                
                // Add content to window
                entity.sendMessage('set-content', {
                    content: this.$tabs[0].outerHTML + this.$content[0].outerHTML
                });
                
                // Start collecting metrics
                this.startMetricsCollection();
            },
            update: function(dt, entity, component) {
                const now = Date.now();
                if (now - this.lastUpdate >= this.updateInterval) {
                    this.updateMetrics(entity);
                    this.lastUpdate = now;
                }
            },
            startMetricsCollection: function() {
                // Set up performance monitoring
                if (window.performance && window.performance.memory) {
                    setInterval(() => {
                        const memory = window.performance.memory;
                        this.metrics.memory.push({
                            time: Date.now(),
                            usedJSHeapSize: memory.usedJSHeapSize,
                            totalJSHeapSize: memory.totalJSHeapSize
                        });
                        
                        // Trim old data points
                        if (this.metrics.memory.length > this.maxDataPoints) {
                            this.metrics.memory.shift();
                        }
                    }, 1000);
                }
                
                // Set up FPS monitoring
                let lastTime = performance.now();
                let frames = 0;
                
                const measureFPS = () => {
                    const now = performance.now();
                    frames++;
                    
                    if (now - lastTime >= 1000) {
                        this.metrics.fps.push({
                            time: now,
                            fps: frames
                        });
                        
                        if (this.metrics.fps.length > this.maxDataPoints) {
                            this.metrics.fps.shift();
                        }
                        
                        frames = 0;
                        lastTime = now;
                    }
                    
                    requestAnimationFrame(measureFPS);
                };
                
                requestAnimationFrame(measureFPS);
            },
            updateMetrics: function(entity) {
                // Update entity and component counts
                this.metrics.entities.push({
                    time: Date.now(),
                    count: entity.engine.entities.getList().length
                });
                
                this.metrics.components.push({
                    time: Date.now(),
                    count: entity.engine.components.getList().length
                });
                
                // Trim old data points
                if (this.metrics.entities.length > this.maxDataPoints) {
                    this.metrics.entities.shift();
                }
                if (this.metrics.components.length > this.maxDataPoints) {
                    this.metrics.components.shift();
                }
                
                // Update the metrics display
                this.updateMetricsDisplay();
            },
            updateMetricsDisplay: function() {
                const $metrics = this.$tabContents.metrics;
                $metrics.empty();
                
                // FPS Chart
                const fpsData = this.metrics.fps.map(m => m.fps);
                const fpsAvg = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
                
                $metrics.append(`
                    <div class="metric-group">
                        <h3>Performance Metrics</h3>
                        <div>Average FPS: ${fpsAvg.toFixed(1)}</div>
                        <div>Current FPS: ${fpsData[fpsData.length - 1] || 0}</div>
                    </div>
                `);
                
                // Memory Usage
                if (this.metrics.memory.length > 0) {
                    const lastMemory = this.metrics.memory[this.metrics.memory.length - 1];
                    const usedMB = (lastMemory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                    const totalMB = (lastMemory.totalJSHeapSize / 1024 / 1024).toFixed(2);
                    
                    $metrics.append(`
                        <div class="metric-group">
                            <h3>Memory Usage</h3>
                            <div>Used: ${usedMB} MB</div>
                            <div>Total: ${totalMB} MB</div>
                        </div>
                    `);
                }
                
                // Entity and Component Counts
                const lastEntities = this.metrics.entities[this.metrics.entities.length - 1];
                const lastComponents = this.metrics.components[this.metrics.components.length - 1];
                
                $metrics.append(`
                    <div class="metric-group">
                        <h3>Game State</h3>
                        <div>Active Entities: ${lastEntities ? lastEntities.count : 0}</div>
                        <div>Active Components: ${lastComponents ? lastComponents.count : 0}</div>
                    </div>
                `);
            },
            messages: {
                'test-result': function(entity, data) {
                    if (data.type && data.result) {
                        this.testResults[data.type].push({
                            time: Date.now(),
                            result: data.result
                        });
                        
                        // Update the appropriate tab content
                        this.updateTestDisplay(data.type);
                    }
                }
            },
            updateTestDisplay: function(type) {
                const $content = this.$tabContents[type];
                $content.empty();
                
                const results = this.testResults[type];
                if (results.length === 0) {
                    $content.append('<div>No test results available</div>');
                    return;
                }
                
                const $table = $('<table style="width: 100%; border-collapse: collapse;"></table>');
                $table.append(`
                    <thead>
                        <tr>
                            <th style="border: 1px solid #444; padding: 5px;">Time</th>
                            <th style="border: 1px solid #444; padding: 5px;">Result</th>
                        </tr>
                    </thead>
                `);
                
                const $tbody = $('<tbody></tbody>');
                results.forEach(result => {
                    $tbody.append(`
                        <tr>
                            <td style="border: 1px solid #444; padding: 5px;">${new Date(result.time).toLocaleTimeString()}</td>
                            <td style="border: 1px solid #444; padding: 5px;">${result.result}</td>
                        </tr>
                    `);
                });
                
                $table.append($tbody);
                $content.append($table);
            }
        };
    };
}); 