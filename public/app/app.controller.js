angular.module('drugmonApp').controller('AppCtrl', function($scope,$http,$filter,$timeout) {

    $scope.monthly_reporting_ratio = {};
    $scope.total_number = {};
    $scope.data_reports = [];
    $scope.sort_by_month = {};
    $scope.sort_by_month_year = {};
    $scope.drugs = [];
    $scope.drug_selected = {};


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
    };
    $scope.get_drug_list = function () {
        $http.post('/drugs/list', {}).then(function(rs){
            $scope.drugs = [];
            $scope.drugs = rs.data.docs;

            if($scope.drugs.length >= 1){
                // $scope.monthly_rp_by_drug($scope.drugs[0].drug_code);
                $scope.drug_selected = $scope.drugs[0];
            }

        }, function(){
            console.log('Error!');
        });

        $http.post('/healthfacility/list', {}).then(function(rs){
            $scope.list_hf = rs.data.docs;
            $scope.list_hf_total = rs.data.docs;
        }, function(){
            console.log('Error!');
        });


        // //Todo: Get drugs
        $http.post('/drugs/list', {}).then(function(rs){
            $scope.list_drug = [];
            $scope.list_drug = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    //Todo: Find drug by HF ID
    $scope.get_hfdrugs = function(){
        $http.post('/hfdrugs/list', {}).then(function(rs){
            $scope.hf_drugs = rs.data.docs;
            $scope.data_review = $scope.hf_drugs;
        }, function(){
            $scope.hf_drugs = [];
        })
    }
    $scope.get_data_reports = function(){
    //Get data register
    $http.post('/drug_histories/list', {}).then(function(rs){
        $scope.data_reports = rs.data.docs;
        $scope.data_reports.forEach(function(e_drug){
            var _xdate = new Date(e_drug.createdAt);
            var _month = _xdate.getMonth()+1;
            var _year = _xdate.getFullYear();

            if(!$scope.sort_by_month[_year]){
                $scope.sort_by_month[_year] = {};
            }
            if(!$scope.sort_by_month[_year][_month]){
                $scope.sort_by_month[_year][_month] = {}
            }
            if(!$scope.sort_by_month[_year][_month][e_drug.hf_id]){
                $scope.sort_by_month[_year][_month][e_drug.hf_id] = {
                    data: []
                }
            }
            $scope.sort_by_month[_year][_month][e_drug.hf_id].data.push(e_drug);
        })

        get_data_chart($scope.sort_by_month);
    }, function(){
        console.log('Error!');
    })
    //Get data register
    $http.post('/drugregisters/list', {}).then(function(rs){
    $scope.data_registers = rs.data.docs;
    $scope.data_registers.forEach(function(e_drug){

    })
    }, function(){
        console.log('Error!');
    })
    }

    $scope.get_data_reports();
    $scope.get_drug_list();
    $scope.get_hfdrugs();


    function str_pad(n) {
        return String("00" + n).slice(-2);
    }

    $scope.data_col_chart = {};
    function get_data_chart(obj,by_drug){
        $scope.data_col_chart = {};
        var data_col_chart = [];
        for(var index in obj) {
            //Loop Year
            var data_charts = {};
            for(var month_idx in obj[index]){
                //Loop Month
                //Check if selected HF
                if($scope.slt_hf && obj[index][month_idx][$scope.slt_hf] && obj[index][month_idx][$scope.slt_hf].data){
                    var hist = {};
                    obj[index][month_idx][$scope.slt_hf].data.map( function (a) { if (a.drug_code in hist) hist[a.drug_code] = hist[a.drug_code]+parseInt(a.drug_abs); else hist[a.drug_code] = parseInt(a.drug_abs); });

                    var list_month = [];

                    for(var abx in $scope.list_drug){
                       // list_month.push([$scope.list_drug[abx].drug_name,{role: "annotation"}]);
                        if(hist[$scope.list_drug[abx].drug_code]){
                            list_month.push({
                                code:$scope.list_drug[abx].drug_code,
                                total:hist[$scope.list_drug[abx].drug_code]
                            })
                        }else{
                            list_month.push({
                                code:$scope.list_drug[abx].drug_code,
                                total:0
                            })
                        }
                    }
                    data_charts[month_idx] = list_month;
                    data_col_chart = data_charts;
                    console.log('data_col_chart');
                    console.log(data_col_chart);
                    var collect_data_chart = [];
                    var first_row = [],
                        is_get_header = false,
                        month_prefix = ["Month"];
                    var row_arr = [];
                    var d = new Date();
                    var m = d.getFullYear();
                    for(var idx in data_col_chart){
                        var col_header = [str_pad(idx) + '/' + m];
                        console.log('col_header');
                        console.log(col_header);
                        var col_arr = [];
                            //Select HF
                        if(by_drug == 0 || by_drug == undefined){
                            data_col_chart[idx].forEach(function(ecol){
                                if(is_get_header != true){
                                    first_row.push(ecol.code,{role: "annotation"});
                                }
                                col_arr.push(ecol.total);
                                col_arr.push(ecol.total);
                            })
                        }else{
                            //Select drug
                            data_col_chart[idx].forEach(function(ecol){
                                if(by_drug != 0 && ecol.code == by_drug){
                                    if(is_get_header != true){
                                        first_row = [ecol.code,{role: "annotation"}];
                                    }
                                    col_arr.push(ecol.total);
                                    col_arr.push(ecol.total);
                                }
                            })
                        }

                        is_get_header = true;
                        row_arr.push(col_header.concat(col_arr));
                    }

                    collect_data_chart.push(month_prefix.concat(first_row));
                    $scope.data_col_chart = collect_data_chart.concat(row_arr);
                    console.log('data_col_chart');
                    console.log(data_col_chart);
                }
                //$scope.data_col_chart.push(_tmp_obj);
            }
        }
    }


    $scope.monthly_reporting_ratio.type = "ColumnChart";
    $scope.total_number.type = "PieChart";

    $scope.total_number.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Slices", type: "number"}
    ], "rows": [
        {c: [
            {v: "Reporting Center"},
            {v: 3}
        ]},
        {c: [
            {v: "Health Post"},
            {v: 31}
        ]}
    ]};

    $scope.monthly_reporting_ratio.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Health Post", type: "number"}
    ], "rows": $scope.data_col_chart};

    $scope.monthly_reporting_ratio.options = {
        'title': '',
        'isStacked':'normal',
        "displayExactValues": true
    };

    var sample = [
        ["Month",'CHX',{role: "annotation"}, 'MSO',{role: "annotation"}, 'OXI',{role: "annotation"}],
        ['05/2017', 30,30, 103,103, 37, 37],
        ['06/2017', 60,60, 45,45, 322, 322],
        ['07/2017', 20,20, 300,300, 20, 20]
    ];


    $scope.slt_hf = '';
    $scope.slt_drug = '0';
    $scope.draw_now = false;
    $scope.change_slt_hf = function(){
        $scope.slt_drug = '0';
        get_data_chart($scope.sort_by_month);
        $scope.myChartObject = {
            "type": "ColumnChart",
            "displayed": false,
            "data": $scope.data_col_chart,
            "options": {
                "title": "",
                "isStacked": "false",
                "displayExactValues": true,
                "displayAnnotations": true,
                annotations: {
                    textStyle: {
                        fontSize: 13,
                    },
                    alwaysOutside: true
                },

                "vAxis": {
                    "title": "Numbers",
                },
                "hAxis": {
                    "title": "Date"
                },
                "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

                "seriesType": "bars",
                "series": {5: {"type": "line","role":"annotation"}},
            }
        }

        $scope.draw_now = true;
        console.log('$scope.data_col_chart');
        console.log($scope.data_col_chart);
    }

    $scope.change_slt_drug = function () {
        get_data_chart($scope.sort_by_month,$scope.slt_drug);
        $scope.myChartObject = {
            "type": "ColumnChart",
            "displayed": false,
            "data": $scope.data_col_chart,
            "options": {
                "title": "",
                "isStacked": "false",
                "displayExactValues": true,
                "displayAnnotations": true,
                annotations: {
                    textStyle: {
                        fontSize: 13,
                    },
                    alwaysOutside: true
                },

                "vAxis": {
                    "title": "Numbers",
                },
                "hAxis": {
                    "title": "Date"
                },
                "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

                "seriesType": "bars",
                "series": {5: {"type": "line","role":"annotation"}},
            }
        }

        $scope.draw_now = true;
    }

    $scope.errorHandler = function(){
        $scope.myChartObject = {};
        $scope.draw_now = false;
    }

    //Todo: select list month
    $scope.list_month = [];
    $scope.filterByMonth = function(){
        var _current_date = new Date();
        var _current_month = _current_date.getMonth()+1;
        var months = moment.monthsShort();
        $scope.list_months = months.slice(0,_current_month);
        $scope.list_month = $scope.list_months.map(function(rs,idx){
            return {
                month_id:idx+1,
                month_name: rs + ', '+_current_date.getFullYear()
            };
        })
        // console.log('list_month');
        // console.log($scope.list_month);
    }

    $scope.filterByMonth();

    //Get SELECT DATA OVERVIEW
    $scope.overview_slt_hf = '';
    $scope.overview_slt_month = '0';
    $scope.dataFilter = {};
    $scope.dataSort = {};
    $scope.change_slt_overview = function () {
        if($scope.overview_slt_hf != 0){
            $scope.dataFilter.hf_id = $scope.overview_slt_hf;
            console.log('overview_slt_hf');
            console.log($scope.overview_slt_hf);
        }else{
            $scope.dataFilter.hf_id = undefined;
        }
    }

    $scope.change_slt_month = function () {
        if($scope.overview_slt_month != 0){
            $scope.dataFilter.month = $scope.overview_slt_month;
            console.log('overview_slt_month');
            console.log($scope.overview_slt_month);
        }else{
            $scope.dataFilter.month = undefined;
        }
    }

    $scope.set_orderBy = function(type){
        $scope.dataSort = type;
    }

    //Todo: Export overview Data
    $scope.exportData = function (rs) {
        console.log('Export Data');
        console.log(rs);
        var template_import = [];
        rs.forEach(function(each,indx){
            var _status = 0;
            if (each.status == 1){
                _status = 'RED';
            }else if (each.status == 2){
                _status = 'YELLOW';
            }else if (each.status == 3) {
                _status = 'GREEN';
            }
            var x_each_line = {
                "#"           : indx+1,
                "HF_NAME"     : each.hf_name,
                "DRUG_NAME"   : each.drug_name,
                "ASL"         : each.total_asl,
                "EOP"         : each.total_eop,
                "STOCK"       : each.total_abs,
                "MONTH"       : each.month,
                "STATUS"      : _status
            };
            template_import.push(x_each_line);
        });

        alasql('SELECT * INTO XLSX("DRUGMON_Overview_Data_Export.xlsx",{headers:true}) FROM ?',[template_import]);

    };

    //Todo: Export Drug Total Data
    $scope.exportDataUsage = function () {
        var template_import = [];
        $scope.usage_summary.forEach(function(each,indx){
            var x_each_line = {
                "#"           : indx+1,
                "DRUG_NAME"     : each.drug_name,
                "TOTAL"   : each.drug_total
            };
            template_import.push(x_each_line);
        });

        alasql('SELECT * INTO XLSX("DRUGMON_UsageReport.xlsx",{headers:true}) FROM ?',[template_import]);

    };

    //Todo :Search Data to review
    $scope.select_slt_to = 0;
    $scope.select_slt_from = 0;
    $scope.searchReviewData = function (hf, mon_from, mon_to ) {
        console.log('hf-mon');
        console.log(hf,mon_from, mon_to);
        $scope.hf_select = hf;
        $scope.month_select_from = mon_from;
        $scope.month_select_to = mon_to;

        var group_byHF = [];
        for(var index in $scope.sort_by_month) {
            //Loop Year
            for(var month_idx in $scope.sort_by_month[index]){
                //Loop Month
                for(var loop_hf in $scope.sort_by_month[index][month_idx]){
                    var xdata = $scope.sort_by_month[index][month_idx][loop_hf].data;
                    //generate
                    var tmp_drug_group = {};
                    xdata.forEach(function(rs){
                        if(!tmp_drug_group[rs.drug_code]){
                            tmp_drug_group[rs.drug_code] = {
                                total_asl: parseInt(rs.drug_asl),
                                total_eop: parseInt(rs.drug_eop),
                                total_abs: parseInt(rs.drug_abs),
                                hf_name: rs.hf_detail.name,
                                createdAt :  rs.createdAt,
                                hf_id: loop_hf,
                                drug_name: rs.drug_name,
                                drug_code: rs.drug_code
                            }
                        }else{
                            tmp_drug_group[rs.drug_code].total_asl = parseInt(rs.drug_asl);
                            tmp_drug_group[rs.drug_code].total_eop = parseInt(rs.drug_eop);
                            tmp_drug_group[rs.drug_code].total_abs = parseInt(rs.drug_abs);
                        }
                    })
                    group_byHF.push(tmp_drug_group);
                }
            }
        }
        var reviewData  = [];
        group_byHF.forEach(function (exs) {
            for(var code in exs){
                reviewData.push(exs[code]);
            }
        })
        console.log('reviewData');
        console.log(reviewData);
        $scope.dataView = reviewData;

        //Todo: check data over view
        var _group_HF = [];
        if ($scope.hf_select == 0 ){
            $scope.dataView.forEach(function (record) {
                var time = $scope.convert_time(record.createdAt);
                var _timeFrom =  parseInt($scope.toTimestamp($scope.month_select_from));
                var _timeTo = parseInt($scope.toTimestamp($scope.month_select_to));
                var _timeCreate = parseInt($scope.toTimestamp(time));
                var _status = null;
                if (parseInt(record.total_abs) <= parseInt(record.total_eop)){
                    _status = 1;
                }else if (parseInt(record.total_eop) < parseInt(record.total_abs) && parseInt(record.total_abs) <= parseInt(record.total_asl)){
                    _status = 2;
                }else if (parseInt(record.total_asl) < parseInt(record.total_abs)) {
                    _status = 3;
                }
                var date = new Date(record.createdAt);
                var mon = date.getMonth()+1;
                var year  = date.getFullYear();
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
                months.forEach(function (mth,i) {
                    if ((i+1) == mon) {
                        $scope.month = mth;
                    }
                });
                if ($scope.month_select_from == 0 && $scope.month_select_to == 0) {
                    var tmp_review_group = {
                        total_asl: parseInt(record.total_asl),
                        total_eop: parseInt(record.total_eop),
                        total_abs: parseInt(record.total_abs),
                        hf_name: record.hf_name,
                        month: $scope.month + ',' + year,
                        hf_id: record.hf_id,
                        drug_name: record.drug_name,
                        drug_code: record.drug_code,
                        status: _status
                    }
                    _group_HF.push(tmp_review_group);
                }else if ($scope.month_select_from != 0 && $scope.month_select_to == 0){
                    if ( _timeFrom <= _timeCreate) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }
                }else if ($scope.month_select_from == 0 && $scope.month_select_to != 0){
                    if ( _timeCreate <= _timeTo) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }
                }else if ($scope.month_select_from != 0 && $scope.month_select_to != 0){
                    if ( _timeFrom <= _timeCreate && _timeCreate <= _timeTo) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }
                }
            })
            $scope.data_over_view = _group_HF;
            console.log('$scope.data_over_view');
            console.log($scope.data_over_view);

        }else if ($scope.hf_select != 0) {
            $scope.dataView.forEach(function (record) {
                if ( $scope.hf_select == record.hf_id) {
                    console.log('Record');
                    console.log(record);
                    var time = $scope.convert_time(record.createdAt);
                    var _timeFrom =  parseInt($scope.toTimestamp($scope.convert_time($scope.month_select_from)));
                    var _timeTo = parseInt($scope.toTimestamp($scope.convert_time($scope.month_select_to)));
                    var _timeCreate = parseInt(parseInt($scope.toTimestamp(time)));
                    console.log('Select_month_From: ' + $scope.month_select_from + '-' + 'select_month_to' + $scope.month_select_to);
                    console.log('time: ' + time + ' - _timeCreate: ' + _timeCreate + '- _timeFrom : ' + _timeFrom + '- _timeTo: ' + _timeTo);
                    var _status = null;
                    if (parseInt(record.total_abs) <= parseInt(record.total_eop)){
                        _status = 1;
                    }else if (parseInt(record.total_eop) < parseInt(record.total_abs) && parseInt(record.total_abs) <= parseInt(record.total_asl)){
                        _status = 2;
                    }else if (parseInt(record.total_asl) < parseInt(record.total_abs)) {
                        _status = 3;
                    }
                    var date = new Date(record.createdAt);
                    var mon = date.getMonth()+1;
                    var year  = date.getFullYear();
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
                    months.forEach(function (mth,i) {
                        if (i == (mon -1)) {
                            $scope.month = mth;
                        }
                    })
                    if ($scope.month_select_from == 0 && $scope.month_select_to == 0) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                        console.log('_group_HF');
                        console.log( _group_HF);
                    }else if ($scope.month_select_from != 0 && $scope.month_select_to == 0){
                        if ( _timeFrom <= _timeCreate) {
                            var tmp_review_group = {
                                total_asl: parseInt(record.total_asl),
                                total_eop: parseInt(record.total_eop),
                                total_abs: parseInt(record.total_abs),
                                hf_name: record.hf_name,
                                month: $scope.month + ',' + year,
                                hf_id: record.hf_id,
                                drug_name: record.drug_name,
                                drug_code: record.drug_code,
                                status: _status
                            }
                            _group_HF.push(tmp_review_group);
                            console.log('_group_HF');
                            console.log( _group_HF);
                        }
                    }else if ($scope.month_select_from == 0 && $scope.month_select_to != 0){
                        if ( _timeCreate <= _timeTo) {
                            var tmp_review_group = {
                                total_asl: parseInt(record.total_asl),
                                total_eop: parseInt(record.total_eop),
                                total_abs: parseInt(record.total_abs),
                                hf_name: record.hf_name,
                                month: $scope.month + ',' + year,
                                hf_id: record.hf_id,
                                drug_name: record.drug_name,
                                drug_code: record.drug_code,
                                status: _status
                            }
                            _group_HF.push(tmp_review_group);
                            console.log('_group_HF');
                            console.log( _group_HF);
                        }
                    }else if ($scope.month_select_from != 0 && $scope.month_select_to != 0){
                        if ( _timeFrom <= _timeCreate && _timeCreate <= _timeTo) {
                            var tmp_review_group = {
                                total_asl: parseInt(record.total_asl),
                                total_eop: parseInt(record.total_eop),
                                total_abs: parseInt(record.total_abs),
                                hf_name: record.hf_name,
                                month: $scope.month + ',' + year,
                                hf_id: record.hf_id,
                                drug_name: record.drug_name,
                                drug_code: record.drug_code,
                                status: _status
                            }
                            _group_HF.push(tmp_review_group);
                            console.log('_group_HF');
                            console.log( _group_HF);
                        }
                    }
                }
            })
            $scope.data_over_view = _group_HF;
            console.log('$scope.data_over_view');
            console.log( $scope.data_over_view);
        }
    }

    //Todo: HF Drug total view
    $scope.usage_slt_hf = 0;
    $scope.usage_slt_drug = 0;
    $scope.usage_slt_from = 0;
    $scope.usage_slt_to = 0;
    $scope.usage_summary = [];

    //Todo:convert time to yyyy-mm-dd
    $scope.convert_time = function convert(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth()+1)).slice(-2),
            day  = ("0" + date.getDate()).slice(-2);
        return [ date.getFullYear(), mnth, day].join("-");
    }

    //Todo:convert time to yyyy-mm
    $scope.convert_time_month = function convert(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth()+1)).slice(-2),
            day  = ("0" + date.getDate()).slice(-2);
        return [ date.getFullYear(), mnth].join("-");
    }

    //Todo: convert timestamp
   $scope.toTimestamp = function (strDate){
        var datum = Date.parse(strDate);
        return datum/1000;
    }

    //Todo: search total drugs view
    $scope.searchTotalDataView = function (hf, drug, from, to ) {
        $scope.hf_select = hf;
        $scope.drug_select = drug;
        $scope.from_month = from;
        $scope.to_month = to;
        $scope.data_history = $scope.data_reports;
        $scope.date_from = $scope.convert_time($scope.from_month);
        $scope.date_to = $scope.convert_time($scope.to_month);

        var group_byHF = [];
        for(var index in $scope.sort_by_month) {
            //Loop Year
            var data_charts = {};
            console.log('Year-index')
            console.log(index);
            for(var month_idx in $scope.sort_by_month[index]){
                //Loop Month
                console.log('month_idx');
                console.log(month_idx);
                if (parseInt(month_idx) < 10 ){
                    var month_ = '0'+month_idx;
                }
                console.log('Year-month: ' + $scope.date_from + ' to ' + $scope.date_to);
                console.log('Time-data: ' + index + '-' + month_);
                $scope.year_month = index + '-' + month_;
                for(var loop_hf in $scope.sort_by_month[index][month_idx]){
                    var xdata = $scope.sort_by_month[index][month_idx][loop_hf].data;
                    //generate
                    var tmp_drug_group = {};
                    xdata.forEach(function(rs){
                        if(!tmp_drug_group[rs.drug_code]){
                            tmp_drug_group[rs.drug_code] = {
                                total_asl: parseInt(rs.drug_asl),
                                total_eop: parseInt(rs.drug_eop),
                                total_abs: parseInt(rs.drug_abs),
                                hf_name: rs.hf_detail.name,
                                // month :  month_ ,
                                // month :  $scope.year_month ,
                                createdAt :  rs.createdAt,
                                hf_id:loop_hf,
                                drug_name: rs.drug_name,
                                drug_code: rs.drug_code
                            }
                        }else{
                            tmp_drug_group[rs.drug_code].total_asl = tmp_drug_group[rs.drug_code].total_asl + parseInt(rs.drug_asl);
                            tmp_drug_group[rs.drug_code].total_eop = tmp_drug_group[rs.drug_code].total_eop + parseInt(rs.drug_eop);
                            tmp_drug_group[rs.drug_code].total_abs = tmp_drug_group[rs.drug_code].total_abs + parseInt(rs.drug_abs);
                        }
                    })
                    group_byHF.push(tmp_drug_group);
                }
            }
        }
        var okdata = [];
        group_byHF.forEach(function (exs) {
            for(var code in exs){
                okdata.push(exs[code]);
            }
        })
        console.log('okdata');
        console.log(okdata);
        $scope.dataOverView = okdata;

            var data_to_show = angular.copy($scope.dataOverView);

            if($scope.usage_slt_hf != 0){
                data_to_show = data_to_show.filter(function(rs){ return rs.hf_id == $scope.usage_slt_hf})
            }
            if($scope.usage_slt_drug != 0){
                data_to_show = data_to_show.filter(function(rs){ return rs.drug_code == $scope.usage_slt_drug})
            }

            //Todo: group data
            var xusage = _.groupBy(data_to_show, function(b) { return b.drug_code});
            console.log('xusage');
            console.log(xusage);
            var x_drugTotal = [];
            for(var xu in xusage){
                var obj_drug = {
                    drug_code: xu,
                    drug_name: xu,
                    drug_total:0
                }
                xusage[xu].forEach(function (rs) {
                    var time = $scope.convert_time(rs.createdAt);
                    var _timeFrom =  parseInt($scope.toTimestamp($scope.date_from));
                    var _timeTo = parseInt($scope.toTimestamp($scope.date_to));
                    var _timeCreate = parseInt($scope.toTimestamp(time));
                    if ( _timeFrom == 0 && _timeTo == 0 ) {
                        console.log('Total');
                        console.log(rs.total_abs);
                        obj_drug.drug_total = obj_drug.drug_total+rs.total_abs
                    }else if (_timeFrom == 0 && _timeTo != 0) {
                        if (_timeCreate < _timeTo ){
                            console.log('Total');
                            console.log(rs.total_abs);
                            obj_drug.drug_total = obj_drug.drug_total+rs.total_abs
                        }
                    }else if (_timeFrom != 0 && _timeTo == 0) {
                        if (_timeFrom < _timeCreate ){
                            console.log('Total');
                            console.log(rs.total_abs);
                            obj_drug.drug_total = obj_drug.drug_total+rs.total_abs
                        }
                    }else if (_timeFrom != 0 && _timeTo != 0){
                        if (_timeFrom < _timeCreate && _timeCreate < _timeTo ){
                            console.log('Total');
                            console.log(rs.total_abs);
                            obj_drug.drug_total = obj_drug.drug_total+rs.total_abs
                        }
                    }
                })
                x_drugTotal.push(obj_drug);
            }
            $scope.usage_summary = x_drugTotal;
            console.log('$scope.usage_summary');
            console.log($scope.usage_summary);
   }

    //Todo: Draw Amount of SMS
    function get_data_amount_sms_chart(obj,month){
       if ( $scope.select_mon == null) {
           $scope.select_mon = 0;
       }else {
           $scope.select_mon = $scope.convert_time_month($scope.select_month);
       }
        $scope.data_amount_chart = {};
        var group_byHF = [];
        var tmp_drug_group = {};
        $scope.data_registers.forEach(function (reg) {
            $scope.list_hf.forEach(function (hf) {
                if(reg.from == hf.person_mobile) {
                    var date = new Date(reg.createdAt);
                    var mon = date.getMonth()+1;
                    var year  = date.getFullYear();
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
                    months.forEach(function (mth,i) {
                        if ((i+1) == mon) {
                            $scope.mth = mth;
                        }
                    });
                    tmp_drug_group = {
                        hf_name: hf.name,
                        createdAt : reg.createdAt,
                        hf_id: hf._id,
                        month_year: $scope.mth + ',' + year,
                    };
                    group_byHF.push(tmp_drug_group);
                }
            })
        })

        console.log('dataSMSView');
        console.log(group_byHF);
        $scope.dataSMSView = group_byHF;

        var dataArray  = [];
        $scope.dataSMSView.forEach(function (hfdetail) {
            var _time_creatAt = $scope.convert_time_month(hfdetail.createdAt);
            console.log('_time_creatAt' + '$scope.select_mon' + $scope.select_mon);
            console.log(_time_creatAt);
            if($scope.select_hf == 0){
                if ($scope.select_mon == 0) {
                    dataArray.push(hfdetail);
                }else {
                    if (_time_creatAt == $scope.select_mon) {
                        dataArray.push(hfdetail);
                    }
                }
            }else {
                if (hfdetail.hf_id == $scope.select_hf ){
                    if ($scope.select_mon == 0) {
                        dataArray.push(hfdetail);
                    }else {
                        if (_time_creatAt == $scope.select_mon) {
                            dataArray.push(hfdetail);
                        }
                    }
                }
            }
        })
        $scope.dataCheck = dataArray;
        console.log('$scope.dataCheck');
        console.log($scope.dataCheck);
        //---------End get HF data-------------

        //Todo: Get list month and year in database
        // var group_month = [];
        // $scope.dataCheck.forEach(function (data) {
        //     $scope.list_months_year = {};
        //     if (data.month != '' ) {
        //         $scope.list_months_year = {
        //             months: data.createdAt
        //         }
        //     }
        //     group_month.push( $scope.list_months_year);
        // })
        // var _time = [];
        // var unique = [];
        // var l = group_month.length, i;
        // for (i = 0; i < l; i ++) {
        //     if(_time[group_month[i].months])continue;
        //     _time[group_month[i].months] = true;
        //     unique.push(group_month[i].months);
        // }
        // var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
        // var year_mon = [];
        // unique.forEach(function (mon) {
        //     var m = mon.split("-");
        //     months.forEach(function (mth,i) {
        //         if (parseInt(parseInt(i) + 1)  == parseInt(m[1])) {
        //             $scope.month = mth + ',' + m[0] ;
        //             year_mon.push($scope.month);
        //         }
        //     })
        // })
        // var list_mon_year = year_mon;
        // $scope.month = [];
        // for(var i = 0;i <  list_mon_year.length; i++){
        //     if($scope.month.indexOf(list_mon_year[i]) == -1){
        //         $scope.month.push(list_mon_year[i])
        //     }
        // }
        // console.log('month');
        // console.log($scope.month);
        //----------End get month of HF---------------

        var uniMonth = [];
        var uniHF = [];
        for(var i = 0; i < $scope.dataCheck.length; i ++) {
            var groupMonth = $scope.dataCheck[i].hf_name;
            if (!uniMonth[groupMonth]) {
                uniMonth[groupMonth] = [];
            }
            uniMonth[groupMonth].push(i);
        }

        console.log('uniMonth');
        console.log(uniMonth);

        var col_arr = [];
        var data_draw = [];
        for (var data in uniMonth) {
            var m_col = uniMonth[data];
            data_draw.push({time: data , quantity: uniMonth[data].length})
        }

            console.log('data_draw');
            console.log(data_draw);
            $scope.exportAmountSMS = data_draw;
            var data_col_chart = [];
            var collect_data_chart = [];
            var first_row = [],
                is_get_header = false,
                month_prefix = ["Month"];
            var col_header = [$scope.select_mon];
            var row_arr = [];
            if(month == 0 || month == undefined){
                data_draw.forEach(function (field) {
                    if(is_get_header != true){
                        first_row.push(field.time,{role: "annotation"});
                    }
                    col_arr.push(field.quantity);
                    col_arr.push(field.quantity);
                })
            }else{
                //Select drug
                data_draw.forEach(function (field) {
                    if(month != 0 && field.time == month){
                        if(is_get_header != true){
                            first_row = [field.time,{role: "annotation"}];
                        }
                        col_arr.push(field.quantity);
                        col_arr.push(field.quantity);
                    }
                })
            }

        is_get_header = true;
        row_arr.push(col_header.concat(col_arr));
        collect_data_chart.push(month_prefix.concat(first_row));
        $scope.data_amount_chart = collect_data_chart.concat(row_arr);

    }

    //Todo: search Amount of SMS
    $scope.select_hf = '';
    $scope.select_month = null;
    $scope.draw_graph_amount_now = false;
   $scope.searchAmountSMSData = function () {
       $scope.s = '0';
       get_data_amount_sms_chart($scope.data_amount_chart);
       $scope.amountSMSChartObject = {
           "type": "ColumnChart",
           "displayed": false,
           "data": $scope.data_amount_chart,
           "options": {
               "title": "",
               "isStacked": "false",
               "displayExactValues": true,
               "displayAnnotations": true,
               annotations: {
                   textStyle: {
                       fontSize: 13,
                   },
                   alwaysOutside: true
               },

               "vAxis": {
                   "title": "Amount of SMS",
               },
               "hAxis": {
                   "title": "Health Facility"
               },
               "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

               "seriesType": "bars",
               "series": {5: {"type": "line","role":"annotation"}},
           }
       }

       $scope.draw_graph_amount_now = true;
       console.log('$scope.data_amount_chart');
       console.log($scope.data_amount_chart);
   }
    //Todo: Export amount of sms data
   $scope.exportAmountSMSData = function (rs) {
       console.log('Export Data');
       console.log(rs);
       var template_import = [];
       rs.forEach(function(each,indx){
           var x_each_line = {
                "#"          : indx+1,
                "HF_NAME"    : each.time,
                "QUANTITY"   : each.quantity,
                "MONTH"      : $scope.select_mon,
           };
           template_import.push(x_each_line);
       });

       alasql('SELECT * INTO XLSX("DRUGMON_Amount_SMS_Export.xlsx",{headers:true}) FROM ?',[template_import]);
   }


    //Todo: Draw Amount of Reported Health Facilities
    function get_data_amount_sms_report_chart(obj,month){
        console.log('selectHF, selectMonth')
        console.log($scope.select_hf_reported + '=' + $scope.select_month_from + '-' + $scope.select_month_to);
        $scope.data_amount_reported_hf_chart = {};
        var group_byHF = [];
        var tmp_drug_group = {};
        $scope.data_registers.forEach(function (reg) {
            $scope.list_hf.forEach(function (hf) {
                if(reg.from == hf.person_mobile) {
                    var date = new Date(reg.createdAt);
                    var mon = date.getMonth()+1;
                    var year  = date.getFullYear();
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
                    months.forEach(function (mth,i) {
                        if ((i+1) == mon) {
                            $scope.mth = mth;
                        }
                    });
                    tmp_drug_group = {
                        hf_name: hf.name,
                        createdAt : reg.createdAt,
                        hf_id: hf._id,
                        month_year: $scope.mth + ',' + year,
                    };
                    group_byHF.push(tmp_drug_group);
                }
            })
        })

        console.log('dataAmountReportedView');
        console.log(group_byHF);
        $scope.dataAmountReportedView = group_byHF;

        var dataArray  = [];
        $scope.dataAmountReportedView.forEach(function (hfdetail) {

            console.log('_month_from:' +$scope.select_month_from);
            console.log('_month_to:' + $scope.select_month_to);
            var _time_creatAt = $scope.toTimestamp($scope.convert_time_month(hfdetail.createdAt));
            var _select_month_from = $scope.toTimestamp($scope.convert_time_month($scope.select_month_from));
            var _select_month_to = $scope.toTimestamp($scope.convert_time_month($scope.select_month_to));
            //check month select
            console.log('select_month_from:' + $scope.convert_time_month($scope.select_month_from));
            console.log('select_month_to:' + $scope.convert_time_month($scope.select_month_to));
            console.log('_time_creatAt:' + _time_creatAt + '- _select_month_from:' + _select_month_from + '- _select_month_to:' + _select_month_to);

            if($scope.select_hf_reported == 0){
                if (_select_month_from == 0 && _select_month_to == 0) {
                    dataArray.push(hfdetail);
                }else if (_select_month_from != 0 && _select_month_to == 0) {
                    if (_time_creatAt >= _select_month_from) {
                        dataArray.push(hfdetail);
                    }
                }else if (_select_month_from == 0 && _select_month_to != 0) {
                    if (_time_creatAt <= _select_month_to ) {
                        dataArray.push(hfdetail);
                    }
                }else if (_select_month_from != 0 && _select_month_to != 0) {
                    if (_select_month_from <= _time_creatAt && _time_creatAt <= _select_month_to ) {
                        dataArray.push(hfdetail);
                    }
                }
            }else {
                if (hfdetail.hf_id == $scope.select_hf_reported ){
                    if (_select_month_from == 0 && _select_month_to == 0) {
                        dataArray.push(hfdetail);
                    }else if (_select_month_from != 0 && _select_month_to == 0) {
                        if (_time_creatAt >= _select_month_from) {
                            dataArray.push(hfdetail);
                        }
                    }else if (_select_month_from == 0 && _select_month_to != 0) {
                        if (_time_creatAt <= _select_month_to ) {
                            dataArray.push(hfdetail);
                        }
                    }else if (_select_month_from != 0 && _select_month_to != 0) {
                        if (_select_month_from <= _time_creatAt && _time_creatAt <= _select_month_to ) {
                            dataArray.push(hfdetail);
                        }
                    }
                }
            }
        })
        $scope.dataReportedCheck = dataArray;
        console.log('$scope.dataReportedCheck');
        console.log($scope.dataReportedCheck);
        //---------End get HF data-------------

        var uni = [];
        for(var i = 0; i < $scope.dataReportedCheck.length; i ++) {
            var groupMonth = $scope.dataReportedCheck[i].month_year;
            if (!uni[groupMonth]) {
                uni[groupMonth] = [];
            }
            uni[groupMonth].push(i);
        }
        console.log('uni')
        console.log(uni)
        var first_row = [],
            is_get_header = false,
            month_prefix = ["Month"];
        var col_arr = [];
        var data_draw = [];
        for (var data in uni) {
            var m_col = uni[data];
            data_draw.push({time: data , quantity: uni[data].length})
        }

        console.log('data_draw');
        console.log(data_draw);
        $scope.exportAmountReported = data_draw;
        var data_col_chart = [];
        var collect_data_chart = [];
        var first_row = [],
            is_get_header = false,
            month_prefix = ["Month"];
        var col_header = [" "];
        var row_arr = [];
        if(month == 0 || month == undefined){
            data_draw.forEach(function (field) {
                if(is_get_header != true){
                    first_row.push(field.time,{role: "annotation"});
                }
                col_arr.push(field.quantity);
                col_arr.push(field.quantity);
            })
        }else{
            //Select drug
            data_draw.forEach(function (field) {
                if(month != 0 && field.time == month){
                    if(is_get_header != true){
                        first_row = [field.time,{role: "annotation"}];
                    }
                    col_arr.push(field.quantity);
                    col_arr.push(field.quantity);
                }
            })
        }
        is_get_header = true;
        row_arr.push(col_header.concat(col_arr));
        collect_data_chart.push(month_prefix.concat(first_row));
        $scope.data_amount_reported_hf_chart = collect_data_chart.concat(row_arr);

    }

    //Todo: search Amount of Reported Health Facilities
    $scope.select_hf_reported = '';
    $scope.select_month_from = null;
    $scope.select_month_to = null;
    $scope.draw_graph_amount_reported_hf_now = false;

    //Todo: Search Amount Reported Health Facility
    $scope.searchAmountHFSMSData = function () {
        $scope.s = '0';
        get_data_amount_sms_report_chart($scope.data_amount_reported_hf_chart);
        $scope.amountReportedChartObject = {
            "type": "ColumnChart",
            "displayed": false,
            "data": $scope.data_amount_reported_hf_chart,
            "options": {
                "title": "",
                "isStacked": "false",
                "displayExactValues": true,
                "displayAnnotations": true,
                annotations: {
                    textStyle: {
                        fontSize: 13,
                    },
                    alwaysOutside: true
                },

                "vAxis": {
                    "title": "Quantity",
                },
                "hAxis": {
                    "title": "Month of Year"
                },
                "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

                "seriesType": "bars",
                "series": {5: {"type": "line","role":"annotation"}},
            }
        }

        $scope.draw_graph_amount_reported_hf_now = true;
        console.log('$scope.data_amount_chart');
        console.log($scope.data_amount_reported_hf_chart);
    }

    //Todo: Export Amount Reported Health Facility
    $scope.exportAmountHFSMSData = function (rs) {
        console.log('Export Data');
        console.log(rs);
        var template_import = [];
        rs.forEach(function(each,indx){
            var x_each_line = {
                "#"          : indx+1,
                "MONTH OF YEAR"    : each.time,
                "QUANTITY"   : each.quantity,
            };
            template_import.push(x_each_line);
        });

        alasql('SELECT * INTO XLSX("DRUGMON_Amount_Reported_HF_Export.xlsx",{headers:true}) FROM ?',[template_import]);
    }


    //Todo: Draw Overview Drug Graph
    function get_data_overview_drug_chart(obj, month) {
        $scope.data_overview_drug_chart = {};
        var group_byHF = [];
        for(var index in $scope.sort_by_month) {
            //Loop Year
            for(var month_idx in $scope.sort_by_month[index]){
                //Loop Month
                for(var loop_hf in $scope.sort_by_month[index][month_idx]){
                    var xdata = $scope.sort_by_month[index][month_idx][loop_hf].data;
                    //generate
                    var tmp_drug_group = {};
                    xdata.forEach(function(rs){
                        if(!tmp_drug_group[rs.drug_code]){
                            tmp_drug_group[rs.drug_code] = {
                                total_asl: parseInt(rs.drug_asl),
                                total_eop: parseInt(rs.drug_eop),
                                total_abs: parseInt(rs.drug_abs),
                                hf_name: rs.hf_detail.name,
                                createdAt :  rs.createdAt,
                                hf_id: loop_hf,
                                drug_name: rs.drug_name,
                                drug_code: rs.drug_code
                            }
                        }else{
                            tmp_drug_group[rs.drug_code].total_asl = parseInt(rs.drug_asl);
                            tmp_drug_group[rs.drug_code].total_eop = parseInt(rs.drug_eop);
                            tmp_drug_group[rs.drug_code].total_abs = parseInt(rs.drug_abs);
                        }
                    })
                    group_byHF.push(tmp_drug_group);
                }
            }
        }
        var reviewData  = [];
        group_byHF.forEach(function (exs) {
            for(var code in exs){
                reviewData.push(exs[code]);
            }
        })
        console.log('dataOverviewDrugReportGraph');
        console.log(reviewData);
        $scope.dataOverviewDrugReportGraph = reviewData;

        var _group_HF = [];
        $scope.dataOverviewDrugReportGraph.forEach(function (record) {
            var time = $scope.convert_time(record.createdAt);
            var _timeFrom =  parseInt($scope.toTimestamp($scope.convert_time_month($scope.slt_status_month_from)));
            var _timeTo = parseInt($scope.toTimestamp($scope.convert_time_month($scope.slt_status_month_to)));
            var _timeCreate = parseInt($scope.toTimestamp(time));
            console.log('_timeCreate:' + _timeCreate + '-_timeFrom:' + _timeFrom + '-_timeTo:' + _timeTo);
            var _status = null;
            if (parseInt(record.total_abs) <= parseInt(record.total_eop)){
                _status = 1;
            }else if (parseInt(record.total_eop) < parseInt(record.total_abs) && parseInt(record.total_abs) <= parseInt(record.total_asl)){
                _status = 2;
            }else if (parseInt(record.total_asl) < parseInt(record.total_abs)) {
                _status = 3;
            }
            var date = new Date(record.createdAt);
            var mon = date.getMonth()+1;
            var year  = date.getFullYear();
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
            months.forEach(function (mth,i) {
                if ((i+1) == mon) {
                    $scope.month = mth;
                }
            });

            if ($scope.select_drugs != 0) {
                if (record.drug_code == $scope.select_drugs){
                    if (_timeFrom == 0 && _timeTo == 0) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }else if (_timeFrom != 0 && _timeTo == 0){
                        if ( _timeFrom <= _timeCreate) {
                            var tmp_review_group = {
                                total_asl: parseInt(record.total_asl),
                                total_eop: parseInt(record.total_eop),
                                total_abs: parseInt(record.total_abs),
                                hf_name: record.hf_name,
                                month: $scope.month + ',' + year,
                                hf_id: record.hf_id,
                                drug_name: record.drug_name,
                                drug_code: record.drug_code,
                                status: _status
                            }
                            _group_HF.push(tmp_review_group);
                        }
                    }else if (_timeFrom == 0 && _timeTo != 0){
                        if ( _timeCreate <= _timeTo) {
                            var tmp_review_group = {
                                total_asl: parseInt(record.total_asl),
                                total_eop: parseInt(record.total_eop),
                                total_abs: parseInt(record.total_abs),
                                hf_name: record.hf_name,
                                month: $scope.month + ',' + year,
                                hf_id: record.hf_id,
                                drug_name: record.drug_name,
                                drug_code: record.drug_code,
                                status: _status
                            }
                            _group_HF.push(tmp_review_group);
                        }
                    }else if (_timeFrom != 0 && _timeTo != 0){
                        if ( _timeFrom <= _timeCreate && _timeCreate <= _timeTo) {
                            var tmp_review_group = {
                                total_asl: parseInt(record.total_asl),
                                total_eop: parseInt(record.total_eop),
                                total_abs: parseInt(record.total_abs),
                                hf_name: record.hf_name,
                                month: $scope.month + ',' + year,
                                hf_id: record.hf_id,
                                drug_name: record.drug_name,
                                drug_code: record.drug_code,
                                status: _status
                            }
                            _group_HF.push(tmp_review_group);
                        }
                    }
                }
            } else {
                if (_timeFrom == 0 && _timeTo == 0) {
                    var tmp_review_group = {
                        total_asl: parseInt(record.total_asl),
                        total_eop: parseInt(record.total_eop),
                        total_abs: parseInt(record.total_abs),
                        hf_name: record.hf_name,
                        month: $scope.month + ',' + year,
                        hf_id: record.hf_id,
                        drug_name: record.drug_name,
                        drug_code: record.drug_code,
                        status: _status
                    }
                    _group_HF.push(tmp_review_group);
                }else if (_timeFrom != 0 && _timeTo == 0){
                    if ( _timeFrom <= _timeCreate) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }
                }else if (_timeFrom == 0 && _timeTo != 0){
                    if ( _timeCreate <= _timeTo) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }
                }else if (_timeFrom != 0 && _timeTo != 0){
                    if ( _timeFrom <= _timeCreate && _timeCreate <= _timeTo) {
                        var tmp_review_group = {
                            total_asl: parseInt(record.total_asl),
                            total_eop: parseInt(record.total_eop),
                            total_abs: parseInt(record.total_abs),
                            hf_name: record.hf_name,
                            month: $scope.month + ',' + year,
                            hf_id: record.hf_id,
                            drug_name: record.drug_name,
                            drug_code: record.drug_code,
                            status: _status
                        }
                        _group_HF.push(tmp_review_group);
                    }
                }
            }
        })

        $scope.dataOverviewCheck = _group_HF;
        console.log('$scope.dataOverviewCheck');
        console.log($scope.dataOverviewCheck);
        var _group_status_data = []

        $scope.dataOverviewCheck.forEach(function (dataView) {
            console.log('dataView');
            console.log(dataView);
            console.log('$scope.select_status.selected');
            console.log($scope.select_status.selected);
            $scope._group_stt = [];
            $scope.stt_status = 'All';
            if ($scope.select_status.selected != ''){
                $scope.select_status.selected.forEach(function (stt) {
                    console.log('stt');
                    console.log(stt);
                    if (dataView.status == stt.status) {
                        _group_status_data.push(dataView);
                        var _group_stt = {
                            status: stt.name
                        }
                    }
                    $scope._group_stt.push(_group_stt);
                })
            }else {
                _group_status_data.push(dataView);
                $scope._group_stt.push($scope.stt_status)
            }

        })
        $scope.dataStatusCheck = _group_status_data;
        console.log('$scope.dataStatusCheck');
        console.log($scope.dataStatusCheck);
        //---------End get HF Drug data-------------

        //Todo: Get list month and year in database
        // var group_month = [];
        // $scope.dataCheck.forEach(function (data) {
        //     $scope.list_months_year = {};
        //     if (data.month != '' ) {
        //         $scope.list_months_year = {
        //             months: data.createdAt
        //         }
        //     }
        //     group_month.push( $scope.list_months_year);
        // })
        // var _time = [];
        // var unique = [];
        // var l = group_month.length, i;
        // for (i = 0; i < l; i ++) {
        //     if(_time[group_month[i].months])continue;
        //     _time[group_month[i].months] = true;
        //     unique.push(group_month[i].months);
        // }
        // var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'];
        // var year_mon = [];
        // unique.forEach(function (mon) {
        //     var m = mon.split("-");
        //     months.forEach(function (mth,i) {
        //         if (parseInt(parseInt(i) + 1)  == parseInt(m[1])) {
        //             $scope.month = mth + ',' + m[0] ;
        //             year_mon.push($scope.month);
        //         }
        //     })
        // })
        // var list_mon_year = year_mon;
        // $scope.month = [];
        // for(var i = 0;i <  list_mon_year.length; i++){
        //     if($scope.month.indexOf(list_mon_year[i]) == -1){
        //         $scope.month.push(list_mon_year[i])
        //     }
        // }
        // console.log('month');
        // console.log($scope.month);
        //----------End get month of HF---------------

        var uniMonth = [];
        var uniHF = [];
        for(var i = 0; i < $scope.dataStatusCheck.length; i ++) {
            var groupMonth = $scope.dataStatusCheck[i].month;
            if (!uniMonth[groupMonth]) {
                uniMonth[groupMonth] = [];
            }
            uniMonth[groupMonth].push(i);
        }

        console.log('uniMonth');
        console.log(uniMonth);

        var col_arr = [];
        var data_draw = [];
        for (var data in uniMonth) {
            var m_col = uniMonth[data];
            data_draw.push({time: data , quantity: uniMonth[data].length})
        }

        console.log('data_draw');
        console.log(data_draw);
        $scope.exportOverviewDrugStatusData = data_draw;
        var data_col_chart = [];
        var collect_data_chart = [];
        var first_row = [],
            is_get_header = false,
            month_prefix = ["Month"];
        var col_header = [" "];
        var row_arr = [];
        if(month == 0 || month == undefined){
            data_draw.forEach(function (field) {
                if(is_get_header != true){
                    first_row.push(field.time,{role: "annotation"});
                }
                col_arr.push(field.quantity);
                col_arr.push(field.quantity);
            })
        }else{
            //Select drug
            data_draw.forEach(function (field) {
                if(month != 0 && field.time == month){
                    if(is_get_header != true){
                        first_row = [field.time,{role: "annotation"}];
                    }
                    col_arr.push(field.quantity);
                    col_arr.push(field.quantity);
                }
            })
        }

        is_get_header = true;
        row_arr.push(col_header.concat(col_arr));
        collect_data_chart.push(month_prefix.concat(first_row));
        $scope.data_overview_drug_chart = collect_data_chart.concat(row_arr);
    }

    //Todo: Search Overview Drug Status
    $scope.select_status = {};
    $scope.select_status.selected = [];
    $scope.select_drugs = '';
    $scope.slt_status_month_from = null;
    $scope.slt_status_month_to = null;
    $scope.draw_graph_overview_drug_status_now = false;
    $scope.list_status = [
        {
            name: 'RED',
            status: 1
        },
        {
            name: 'YELLOW',
            status: 2
        },
        {
            name: 'GREEN',
            status: 3
        }
    ]
    $scope.searchOverviewDrugStatus = function () {
        $scope.s = '0';
        get_data_overview_drug_chart($scope.data_overview_drug_chart);
        $scope.amountOverviewStatusObject = {
            "type": "ColumnChart",
            "displayed": false,
            "data": $scope.data_overview_drug_chart,
            "options": {
                "title": "",
                "isStacked": "false",
                "displayExactValues": true,
                "displayAnnotations": true,
                annotations: {
                    textStyle: {
                        fontSize: 13,
                    },
                    alwaysOutside: true
                },

                "vAxis": {
                    "title": "Quantity",
                },
                "hAxis": {
                    "title": "Month of Year"
                },
                "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

                "seriesType": "bars",
                "series": {5: {"type": "line","role":"annotation"}},
            }
        }

        $scope.draw_graph_overview_drug_status_now = true;
        console.log('$scope.data_overview_drug_chart');
        console.log($scope.data_overview_drug_chart);
    }

    //Todo: Export Overview Drug Status
    $scope.exportOverviewDrugStatus = function (rs) {
        if ($scope.select_drugs == 0){
            $scope.select_drugs = 'All';
        }

        // var  _status_color  = $scope._group_stt;
        console.log('_status_color');
        console.log($scope._group_stt);
        console.log('Export Data');
        console.log(rs);
        var template_import = [];
        rs.forEach(function(each,indx){
            var x_each_line = {
                "#"          : indx+1,
                "MONTH OF YEAR"    : each.time,
                // "STATUS"    : $scope.stt_status,
                "DRUG CODE"    : $scope.select_drugs,
                "QUANTITY"   : each.quantity,
            };
            template_import.push(x_each_line);
        });

        alasql('SELECT * INTO XLSX("DRUGMON_Overview_Drugs_Status_Export.xlsx",{headers:true}) FROM ?',[template_import]);
    }
});