package MissionGlance::DataSources::JEMA;
# Should be from the JEMA directory; currently manually extracted. :(
sub get {
    while (<DATA>) {
        my ($pref, $miss) = split /,/,$_,2;
        $data{$pref} = { missionaries => 0+$miss };
    }
    return \%data;
}

1;

__DATA__
Aichi,  77 
Akita,  2, 
Aomori, 19
Chiba,  97
Ehime,  0
Fukui,   4
Fukuoka, 38
Fukushima, 8
Gifu, 14
Gunma, 15
Hiroshima, 17
Hokkaido, 119 
Hyogo, 104 
Ibaraki, 30
Ishikawa, 15
Iwate, 0
Kagawa, 8
Kagoshima, 7
Kanagawa, 126
Kochi,  2
Kumamoto, 25
Kyoto, 63
Mie, 14
Miyagi, 46
Miyazaki, 9
Nagano, 63
Nagasaki, 10 
Nara, 43 
Niigata, 7 
Okayama, 14 
Okinawa, 77 
Saga, 4 
Saitama, 140 
Shiga,  30 
Shimane, 2
Shizuoka, 57 
Tochigi, 23 
Tokushima, 4 
Tottori,  0
Toyama,  7
Tokyo, 441 
Wakayama, 2 
Yamagata, 3 
Yamaguchi,14 
Yamanashi, 10 
Oita, 5 
Osaka, 56 
