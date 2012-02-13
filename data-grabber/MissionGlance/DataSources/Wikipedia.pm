package MissionGlance::DataSources::Wikipedia;
use Data::Dumper;
use WWW::Wikipedia;

my $wiki = WWW::Wikipedia->new();
sub get_pref {
    my $pref = shift;
    my $result = $wiki->search($pref." Prefecture");
    my $data = {};
    if (my $raw = $result->raw()) {
        my @lines = split /\n/, $raw;
        while (@lines) {
            my $line = shift @lines;
            if ($line =~ /Infobox Prefecture/) {
                while (@lines) {
                    $line = shift @lines;
                    last if $lines[0] =~ /^\}\}/;
                    if ($line =~ /\|\s*(.*?)\s*=\s*(.*)/) { # Process infobox
                        my $key = $1;
                        my $value = $2;
                        $value =~ s/\{\{lang\|ja\|(.*)\}\}/$1/i;
                        $data->{$key} = $value;
                    }
                }
            } elsif ($line =~ /Infobox settlement/) { # Tokyo
                while (@lines) {
                    $line = shift @lines;
                    last if $lines[0] =~ /^\}\}/;
                    if ($line =~ /\|\s*(.*?)\s*=\s*(.*)/) { # Process infobox
                        my $key = $1;
                        if ($key eq "native_name") { $key = "JapaneseName" }
                        if ($key eq "population_total") { $key = "Population" }
                        if ($key eq "area_total_km2") { $key = "TotalArea" }
                        my $value = $2;
                        $value =~ s/\{\{lang\|ja\|(.*)\}\}/$1/i;
                        $data->{$key} = $value;
                    }
                }
            } elsif ($line =~ /=\s*Cities\s*=/) {
                while (@lines) {
                    $line = shift @lines;
                    last if $lines[0] =~ /^=/;
                    $line=~/\|(.*?)\]\]$/ && push @{$data->{Cities}}, $1;
                }
            } elsif ($line =~ /=\s*Towns.*\s*=/) {
                while (@lines) {
                    $line = shift @lines;
                    last if $lines[0] =~ /^=/;
                    $line=~/\|(.*?)\]\]$/ && push @{$data->{Towns}}, $1;
                }
            }
        }
    }
    return $data;
}

