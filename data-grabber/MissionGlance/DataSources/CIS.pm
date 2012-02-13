package MissionGlance::DataSources::CIS;
use Web::Scraper;
use URI;
use Data::Dumper;
my $url = "http://www.church-info.org/html/churchmap_main.html";
my $scraper = scraper {
    process "td.tableborder table tr" => "rows[]" =># "TEXT";
    scraper {
        process "td.smi011" => "prefecture" => "TEXT";
        process "td" => "elements[]" => "TEXT";
    }
};
my @line = qw/population churches pop_per_church members attendance baptisms sunday_school/;

sub get {
    my $res = $scraper->scrape( URI->new($url) )->{rows};
    my %data;
    for (@$res) {
        shift @{$_->{elements}};
        s/,//g for @{$_->{elements}};
        @{$data{$_->{prefecture}}}{@line} = @{$_->{elements}};
    }
    \%data;
}

1;
